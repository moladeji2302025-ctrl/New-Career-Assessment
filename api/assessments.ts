import { neon } from '@neondatabase/serverless';
import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';

const MAX_PAYLOAD_BYTES = 65_536;

const REQUIRED_FIELDS = [
  'respondentName', 'respondentGroup', 'organizationDepartment',
  'careerInterests', 'enjoyedSkills', 'workEnvironment',
  'primaryMotivation', 'biggestStrength', 'shortTermGoal', 'longTermGoal',
] as const;

const VALID_GROUPS = new Set(['IT_STUDENT', 'NYSC_CORP_MEMBER']);

async function ensureTable(sql: ReturnType<typeof neon>) {
  await sql`
    CREATE TABLE IF NOT EXISTS assessments (
      id                       TEXT        PRIMARY KEY,
      submitted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      respondent_name          TEXT        NOT NULL,
      respondent_group         TEXT        NOT NULL,
      organization_department  TEXT        NOT NULL,
      school_program           TEXT,
      expected_completion_date TEXT,
      program_studied          TEXT,
      degree_required          TEXT,
      service_end_date         TEXT,
      career_interests         JSONB       NOT NULL DEFAULT '[]',
      enjoyed_skills           JSONB       NOT NULL DEFAULT '[]',
      work_environment         TEXT        NOT NULL,
      primary_motivation       TEXT        NOT NULL,
      biggest_strength         TEXT        NOT NULL,
      short_term_goal          TEXT        NOT NULL,
      long_term_goal           TEXT        NOT NULL,
      scenario_responses       JSONB       NOT NULL DEFAULT '{}',
      ai_report                TEXT,
      recommended_department   TEXT,
      department_reason        TEXT
    )
  `;
  // Migrate existing tables that predate the department recommendation columns
  await sql`ALTER TABLE assessments ADD COLUMN IF NOT EXISTS recommended_department TEXT`;
  await sql`ALTER TABLE assessments ADD COLUMN IF NOT EXISTS department_reason TEXT`;
}

const NIGCOMSAT_DEPARTMENTS = [
  { name: "MD's Office",                        description: "Direct support to the Managing Director; executive governance, board matters, and strategic organisational oversight. Suits people with strong strategic thinking, excellent communication, and broad organisational awareness." },
  { name: 'ED Technical office',                description: "Support to the Executive Director of Technical; bridging engineering leadership with corporate management. Suits technically literate people who are also effective communicators and problem-solvers at a management level." },
  { name: 'Broadcast',                          description: "Satellite broadcast transmission — managing uplink/downlink, transponder capacity, and broadcast signal delivery for TV and radio clients. Suits people with interest in RF/electrical engineering, telecommunications, and technical operations." },
  { name: 'Satellite Capital Management',       description: "Managing NigComSat satellite assets, lifecycle planning, orbital slot management, and capital investment in space infrastructure. Suits analytically strong people with interest in engineering management, asset management, or space systems." },
  { name: 'Innovation and Satellite Application', description: "R&D, new satellite application products, and digital transformation initiatives. Suits highly curious, creative people who enjoy exploring new technology, building prototypes, and solving frontier problems." },
  { name: 'Satellite Frequency Management',     description: "ITU filing, spectrum coordination, radio frequency licensing, and interference management. Suits detail-oriented people with interest in telecommunications regulation, RF engineering, or technical standards and compliance." },
  { name: 'Power & Radio Frequency',            description: "Power infrastructure and RF engineering supporting ground station and satellite operations. Suits people with electrical/electronics engineering background who enjoy hands-on technical infrastructure work." },
  { name: 'Network Operating Center',           description: "24/7 monitoring and management of telecommunications network uptime, fault resolution, and service quality. Suits analytical, alert, process-driven people who thrive under operational pressure and enjoy monitoring complex systems." },
  { name: 'IT Services',                        description: "Internal ICT infrastructure, software systems, cybersecurity, databases, and technology support. Suits people with programming, networking, system administration, or cybersecurity interests who enjoy solving technology problems." },
  { name: 'Regional Business office',           description: "Managing NigComSat commercial operations across Nigeria's geopolitical zones — client acquisition, account management, and regional revenue growth. Suits outgoing relationship-builders with business acumen." },
  { name: 'Sales',                              description: "Direct sales of satellite services to corporate, government, and institutional clients. Suits persuasive, target-driven people who enjoy building relationships and closing deals." },
  { name: 'Marketing',                          description: "Brand management, digital marketing, market research, and marketing communications. Suits creative, data-aware people who enjoy storytelling, brand building, and connecting with audiences." },
  { name: 'Broadband',                          description: "Design, deployment, and commercial management of NigComSat's broadband and VSAT connectivity services. Suits people who blend technical understanding with commercial awareness and customer focus." },
  { name: 'Corporate Affairs Department',       description: "Public relations, government relations, corporate communications, and media management. Suits excellent communicators who enjoy shaping public perception and managing strategic stakeholder relationships." },
  { name: 'Finance',                            description: "Financial accounting, revenue management, payroll, treasury, and regulatory financial reporting. Suits numerically strong, detail-oriented people who enjoy working with financial data and ensuring accuracy." },
  { name: 'Budget and Planning',                description: "Corporate budget preparation, financial forecasting, capital planning, and monitoring budget performance. Suits analytical, strategic-minded people who enjoy modelling scenarios and translating plans into numbers." },
  { name: 'Internal Audit',                     description: "Independent assurance on internal controls, risk management, and compliance. Suits systematic, objective, process-focused people who enjoy scrutinising operations and identifying gaps." },
  { name: 'Procurement',                        description: "Vendor selection, contract management, and supply chain for goods and services. Suits negotiation-oriented, detail-conscious people who enjoy managing supplier relationships and process compliance." },
  { name: 'Human Capital Management',           description: "Recruitment, learning & development, performance management, and staff welfare. Suits empathetic, people-focused individuals who enjoy building organisational culture and developing talent." },
  { name: 'Admin',                              description: "Administrative operations, facilities, fleet, and office coordination. Suits organised, reliable, service-minded people who enjoy keeping an organisation running smoothly behind the scenes." },
  { name: 'Legal Services',                     description: "Contract review, legal advisory, regulatory compliance, and dispute resolution. Suits people with legal education or strong analytical and writing skills who enjoy applying rules and protecting organisational interests." },
  { name: 'SERVICOM',                           description: "Service Compact with All Nigerians — ensuring quality of service delivery, client feedback management, and service standards compliance. Suits service-oriented, process-conscious people who care about citizen and client experience." },
  { name: 'Corporate Strategy',                 description: "Long-term strategic planning, business intelligence, competitive analysis, and corporate performance management. Suits big-picture thinkers with strong research and analytical skills who enjoy shaping organisational direction." },
];

const DEPT_LIST = NIGCOMSAT_DEPARTMENTS
  .map(d => `- ${d.name}: ${d.description}`)
  .join('\n');

interface DepartmentRecommendation {
  aiReport: string;
  recommendedDepartment: string;
  departmentReason: string;
}

async function generateAIReport(payload: Record<string, unknown>): Promise<DepartmentRecommendation> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const group = payload.respondentGroup === 'IT_STUDENT' ? 'IT Student (intern)' : 'NYSC Corp Member';
  const name = payload.respondentName as string;

  const userPrompt = `
You are an expert career guidance counsellor with deep knowledge of the Nigerian graduate job market, NYSC, and tech industry career paths across Africa. You have just received a completed career assessment from a ${group} named ${name} at NigComSat (Nigerian Communications Satellite Limited).

Here is their full assessment data:
${JSON.stringify(payload, null, 2)}

Generate a comprehensive, personalised career guidance report for ${name}.

The report must be written in a warm but professional tone — like a mentor who genuinely believes in this person. Structure it using the following sections (use markdown headings):

## Career Personality Profile
A 2–3 paragraph narrative describing ${name}'s professional personality, working style, and values as inferred from their scenario responses and stated preferences. Be specific to their answers — do not be generic.

## Top Career Matches
List the top 3–5 career paths most aligned with their interests, skills, and personality. For each:
- **Career title** — A brief explanation (2–3 sentences) of why this is a strong fit for ${name} specifically, referencing their actual answers.

## Immediate Action Plan (Next 90 Days)
5–7 concrete, specific actions ${name} can take right now to move toward their short-term goal. Be practical and Nigeria/Africa-aware (mention specific platforms, certifications, communities that are accessible and relevant).

## Skills to Develop
3–5 skills that, based on the gap between where they are and where they want to go, would have the highest career leverage. For each: name the skill, why it matters for their specific trajectory, and one specific way to start developing it.

## Long-Term Vision Alignment
A 1–2 paragraph reflection connecting their stated long-term goal to their current profile — affirm what's already aligned, gently flag any gaps, and offer encouragement grounded in realistic optimism.

## A Word from Your Career Mentor
A closing 1-paragraph personal message directly addressing ${name} by first name. Warm, motivating, specific. End with one powerful question for them to reflect on.

---

Important guidelines:
- Be specific to this person's actual data — never give generic career advice
- Reference their scenario responses where relevant (e.g. "Your response to the scenario about handling feedback suggests...")
- Keep the total report between 700–1000 words
- Use markdown formatting (headings, bold, bullet points) that will render cleanly
- Write for a Nigerian/African professional context

---

After all the report sections above, append the following block EXACTLY as shown (with the markers on their own lines). This is for NigComSat's HR team to determine the most suitable department posting for this individual:

---DEPT_REC_START---
{"department": "<one department name from the list below>", "reason": "<2–3 sentences explaining why this department is the best fit, referencing specific answers from the assessment>"}
---DEPT_REC_END---

NigComSat departments to choose from (pick exactly one):
${DEPT_LIST}

The recommendation must be based on the person's career interests, skills, working style, personality, and goals — not on their currently assigned department.
`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected AI response type');

  const raw = content.text;

  // Extract the department recommendation block
  const deptMatch = raw.match(/---DEPT_REC_START---\s*([\s\S]*?)\s*---DEPT_REC_END---/);
  let recommendedDepartment = '';
  let departmentReason = '';
  let aiReport = raw;

  if (deptMatch) {
    try {
      const rec = JSON.parse(deptMatch[1].trim()) as { department: string; reason: string };
      recommendedDepartment = rec.department ?? '';
      departmentReason = rec.reason ?? '';
    } catch {
      // JSON parse failed — leave recommendation empty
    }
    // Strip the block from the displayed report
    aiReport = raw.replace(/\n*---DEPT_REC_START---[\s\S]*?---DEPT_REC_END---\n*/g, '').trim();
  }

  return { aiReport, recommendedDepartment, departmentReason };
}

function validatePayload(payload: Record<string, unknown>): string | null {
  for (const field of REQUIRED_FIELDS) {
    const value = payload[field];
    if (value === undefined || value === null || value === '') {
      return `Missing required field: ${field}`;
    }
    if (field === 'careerInterests' || field === 'enjoyedSkills') {
      if (!Array.isArray(value) || value.length === 0) {
        return `${field} must be a non-empty array`;
      }
    }
  }
  if (!VALID_GROUPS.has(payload.respondentGroup as string)) {
    return 'Invalid respondentGroup value';
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({ detail: 'Payload too large.' });
  }

  const payload = req.body as Record<string, unknown>;
  const validationError = validatePayload(payload);
  if (validationError) {
    return res.status(400).json({ detail: validationError });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [{ aiReport, recommendedDepartment, departmentReason }] = await Promise.all([
      generateAIReport(payload),
      ensureTable(sql),
    ]);

    const id = randomUUID();

    await sql`
      INSERT INTO assessments (
        id, respondent_name, respondent_group, organization_department,
        school_program, expected_completion_date,
        program_studied, degree_required, service_end_date,
        career_interests, enjoyed_skills, work_environment,
        primary_motivation, biggest_strength, short_term_goal, long_term_goal,
        scenario_responses, ai_report, recommended_department, department_reason
      ) VALUES (
        ${id},
        ${payload.respondentName as string},
        ${payload.respondentGroup as string},
        ${payload.organizationDepartment as string},
        ${(payload.schoolProgram as string) ?? null},
        ${(payload.expectedCompletionDate as string) ?? null},
        ${(payload.programStudied as string) ?? null},
        ${(payload.degreeRequired as string) ?? null},
        ${(payload.serviceEndDate as string) ?? null},
        ${JSON.stringify(payload.careerInterests)},
        ${JSON.stringify(payload.enjoyedSkills)},
        ${payload.workEnvironment as string},
        ${payload.primaryMotivation as string},
        ${payload.biggestStrength as string},
        ${payload.shortTermGoal as string},
        ${payload.longTermGoal as string},
        ${JSON.stringify(payload.scenarioResponses ?? {})},
        ${aiReport},
        ${recommendedDepartment || null},
        ${departmentReason || null}
      )
    `;

    return res.status(201).json({
      id,
      submittedAt: new Date().toISOString(),
      aiReport,
      recommendedDepartment,
      departmentReason,
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    return res.status(500).json({ detail: 'Failed to process assessment. Please try again.' });
  }
}
