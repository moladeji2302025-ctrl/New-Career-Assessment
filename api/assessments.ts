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
  { name: "MD's office",                 description: 'Executive management, corporate strategy, and governance' },
  { name: 'Procurement',                 description: 'Vendor management, procurement processes, and supply chain' },
  { name: 'Technical services',          description: 'Satellite technical operations, engineering support, and maintenance of space assets' },
  { name: 'Innovation',                  description: 'R&D, new technology initiatives, and digital transformation projects' },
  { name: 'IT',                          description: 'Information technology infrastructure, software systems, and internal ICT support' },
  { name: 'SCC',                         description: 'Satellite Control Center — controlling and monitoring NigComSat satellites in orbit' },
  { name: 'NOC',                         description: 'Network Operations Center — monitoring and maintaining telecommunications network uptime' },
  { name: 'Broadband',                   description: 'Broadband internet services design, deployment, and customer connectivity solutions' },
  { name: 'Human capital management/HR', description: 'People management, recruitment, training, learning & development, and employee relations' },
  { name: 'Account',                     description: 'Financial accounting, reporting, payroll, and treasury management' },
  { name: 'Audit',                       description: 'Internal audit, compliance, and enterprise risk management' },
  { name: 'Admin',                       description: 'Administrative support, office management, and facilities coordination' },
  { name: 'Maintenance',                 description: 'Physical infrastructure maintenance, building services, and equipment servicing' },
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
