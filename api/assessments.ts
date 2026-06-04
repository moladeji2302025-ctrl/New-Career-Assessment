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
      ai_report                TEXT
    )
  `;
}

async function generateAIReport(payload: Record<string, unknown>): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const group = payload.respondentGroup === 'IT_STUDENT' ? 'IT Student (intern)' : 'NYSC Corp Member';
  const name = payload.respondentName as string;

  const userPrompt = `
You are an expert career guidance counsellor with deep knowledge of the Nigerian graduate job market, NYSC, and tech industry career paths across Africa. You have just received a completed career assessment from a ${group} named ${name}.

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
`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected AI response type');
  return content.text;
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
    const [aiReport] = await Promise.all([
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
        scenario_responses, ai_report
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
        ${aiReport}
      )
    `;

    return res.status(201).json({ id, submittedAt: new Date().toISOString(), aiReport });
  } catch (error) {
    console.error('Assessment submission error:', error);
    return res.status(500).json({ detail: 'Failed to process assessment. Please try again.' });
  }
}
