import type { Question, AnswerMap } from '../types/question';
import {
  ORGANIZATION_DEPARTMENTS,
  ENJOYED_SKILLS_OPTIONS,
  PRIMARY_MOTIVATION_OPTIONS,
  BIGGEST_STRENGTH_OPTIONS,
} from './organizationDepartments';
import { NIGERIAN_UNIVERSITY_PROGRAM_LIST } from './nigerianUniversityPrograms';
import { PROGRAM_NAMES, getDegreeForProgram } from './programDegreeMapping';
import { SCENARIO_QUESTIONS } from './scenarioQuestions';
import type { AIAnalysisPayload } from '../types/assessment';

// Fixed seed — all users see identical shuffled order
const SHUFFLE_SEED = 20250101;

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = ((s * 1103515245) + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const FIXED_QUESTIONS: Question[] = [
  {
    id: 'q_name',
    type: 'text',
    question: 'What is your full name?',
    placeholder: 'Your full name',
    required: true,
    shuffleable: false,
  },
  {
    id: 'q_group',
    type: 'single-select-card',
    question: 'Which of these describes you right now?',
    required: true,
    shuffleable: false,
    columns: 2,
    options: [
      {
        value: 'IT_STUDENT',
        label: 'IT Student',
        description: 'Undergoing your industrial training as part of your degree programme.',
      },
      {
        value: 'NYSC_CORP_MEMBER',
        label: 'NYSC Corp Member',
        description: 'Currently serving your mandatory National Youth Service Corps year.',
      },
    ],
  },
  {
    id: 'q_dept',
    type: 'single-select-dropdown',
    question: 'Which department are you attached to?',
    required: true,
    shuffleable: false,
    optionGroups: ORGANIZATION_DEPARTMENTS.map(g => ({
      group: g.group,
      options: g.departments.map(d => ({ value: d, label: d })),
    })),
  },
  // IT Student only
  {
    id: 'q_school_program',
    type: 'single-select-dropdown',
    question: 'What are you currently studying?',
    hint: 'Select the programme that best matches yours.',
    required: true,
    shuffleable: false,
    condition: (a: AnswerMap) => a.q_group === 'IT_STUDENT',
    options: NIGERIAN_UNIVERSITY_PROGRAM_LIST.map(p => ({ value: p, label: p })),
  },
  {
    id: 'q_completion_date',
    type: 'date',
    question: 'When do you expect to complete your programme?',
    required: true,
    shuffleable: false,
    condition: (a: AnswerMap) => a.q_group === 'IT_STUDENT',
  },
  // NYSC only
  {
    id: 'q_program_studied',
    type: 'text-autofill',
    question: 'What programme did you study at university?',
    placeholder: 'E.g. Computer Science, Law, Accounting',
    hint: 'Type to see suggestions.',
    required: true,
    shuffleable: false,
    condition: (a: AnswerMap) => a.q_group === 'NYSC_CORP_MEMBER',
    datalistOptions: PROGRAM_NAMES,
  },
  {
    id: 'q_degree',
    type: 'text',
    question: 'What degree did you obtain?',
    placeholder: 'E.g. B.Sc. Computer Science',
    hint: 'Auto-filled if your programme is recognised — you can edit it.',
    required: true,
    shuffleable: false,
    condition: (a: AnswerMap) => a.q_group === 'NYSC_CORP_MEMBER',
  },
  {
    id: 'q_service_end',
    type: 'date',
    question: 'When does your NYSC service year end?',
    required: true,
    shuffleable: false,
    condition: (a: AnswerMap) => a.q_group === 'NYSC_CORP_MEMBER',
  },
];

// Scenario questions where multiple answers can genuinely apply at once
const MULTI_SELECT_SCENARIO_IDS = new Set([
  'sq_energy_drain',     // multiple things can drain you
  'sq_free_saturday',    // you can do more than one thing on a free day
  'sq_tools_enjoy',      // you can be comfortable with more than one tool type
  'sq_side_project',     // you might have more than one type of side project in mind
  'sq_achievement_type', // more than one achievement type can feel meaningful
  'sq_new_skill',        // you may want training in more than one area
]);

const SHUFFLEABLE_QUESTIONS: Question[] = [
  {
    id: 'q_career_interests',
    type: 'categorized-multi-select',
    question: 'Which career fields genuinely excite you?',
    hint: 'Select all that apply. Be honest — not aspirational.',
    required: true,
    shuffleable: true,
    minSelections: 1,
  },
  {
    id: 'q_skills',
    type: 'multi-select-pill',
    question: 'What activities come naturally to you and give you energy?',
    hint: "Think about what you enjoy doing — not just what you're told you're good at.",
    required: true,
    shuffleable: true,
    options: ENJOYED_SKILLS_OPTIONS.map(s => ({ value: s, label: s })),
    minSelections: 1,
  },
  {
    id: 'q_work_env',
    type: 'single-select-card',
    question: 'Where do you do your best work?',
    required: true,
    shuffleable: true,
    columns: 2,
    options: [
      { value: 'Fully remote', label: 'Fully remote', description: 'From anywhere — home, cafés, wherever Wi-Fi exists.' },
      { value: 'Hybrid', label: 'Hybrid', description: 'Some days in the office, some days remote.' },
      { value: 'On-site', label: 'On-site', description: 'In the office or on location, every day.' },
      { value: 'Flexible (I decide day by day)', label: 'Flexible', description: 'Completely flexible — I decide based on the day and task.' },
    ],
  },
  {
    id: 'q_motivation',
    type: 'single-select-dropdown',
    question: 'What drives you most in your career?',
    required: true,
    shuffleable: true,
    options: PRIMARY_MOTIVATION_OPTIONS.map(o => ({ value: o, label: o })),
  },
  {
    id: 'q_strength',
    type: 'single-select-card',
    question: 'Which best describes your biggest professional strength?',
    required: true,
    shuffleable: true,
    columns: 2,
    options: BIGGEST_STRENGTH_OPTIONS.map(o => {
      const parts = o.split(' — ');
      return {
        value: o,
        label: parts[0]?.trim() ?? o,
        description: parts.slice(1).join(' — ').trim(),
      };
    }),
  },
  {
    id: 'q_org_role_type',
    type: 'single-select-card',
    question: 'Within an organisation like NigComSat, which type of work would you find most fulfilling?',
    hint: 'Think about where your skills and energy naturally belong — not what sounds most impressive.',
    required: true,
    shuffleable: true,
    columns: 1,
    options: [
      {
        value: 'Technical & Engineering',
        label: 'Technical & Engineering',
        description: 'Hands-on with systems, infrastructure, and technology — solving complex engineering and operational problems.',
      },
      {
        value: 'Business & Commercial',
        label: 'Business & Commercial',
        description: 'Growing revenue, managing client relationships, sales, and driving the commercial side of the business.',
      },
      {
        value: 'Finance & Compliance',
        label: 'Finance & Compliance',
        description: 'Managing budgets, auditing, procurement, and ensuring financial accuracy and regulatory compliance.',
      },
      {
        value: 'Strategy & Corporate Affairs',
        label: 'Strategy & Corporate Affairs',
        description: "Shaping long-term direction, stakeholder communications, public relations, and the organisation's brand and positioning.",
      },
      {
        value: 'People, Admin & Legal',
        label: 'People, Admin & Legal',
        description: 'Building strong teams, managing HR, handling legal matters, and ensuring smooth day-to-day operations.',
      },
      {
        value: 'Innovation & Research',
        label: 'Innovation & Research',
        description: 'Developing new products, exploring emerging technologies, and solving problems at the frontier of your field.',
      },
    ],
  },
  {
    id: 'q_collab_style',
    type: 'single-select-card',
    question: 'How do you naturally work best in a professional environment?',
    hint: 'Choose the option that most accurately reflects how you operate — not how you wish you did.',
    required: true,
    shuffleable: true,
    columns: 1,
    options: [
      {
        value: 'Deep technical focus',
        label: 'Deep technical focus',
        description: 'I work best on focused technical problems — systems, equipment, data, and engineering details.',
      },
      {
        value: 'External relationships',
        label: 'External relationships',
        description: "I thrive when representing the organisation — dealing with clients, partners, media, or government.",
      },
      {
        value: 'Internal coordination',
        label: 'Internal coordination',
        description: "I'm most effective coordinating across teams, managing processes, and keeping operations running smoothly.",
      },
      {
        value: 'Analysis & planning',
        label: 'Analysis & planning',
        description: 'I do my best work researching, analysing data, modelling scenarios, and developing strategic recommendations.',
      },
      {
        value: 'People development',
        label: 'People development',
        description: 'I naturally focus on building people, team culture, training, and organisational capability.',
      },
    ],
  },
  {
    id: 'q_short_goal',
    type: 'textarea',
    question: 'Where do you want to be in the next 1–2 years?',
    placeholder: 'E.g. Land a junior software engineer role and ship my first production project.',
    required: true,
    shuffleable: true,
    rows: 3,
  },
  {
    id: 'q_long_goal',
    type: 'textarea',
    question: 'What does your career look like 5–10 years from now?',
    placeholder: 'E.g. Lead a product team at an African tech company or launch my own venture.',
    required: true,
    shuffleable: true,
    rows: 3,
  },
  // 20 scenario questions — multi-select where more than one answer can genuinely apply
  ...SCENARIO_QUESTIONS.map(sq => ({
    id: sq.id,
    type: 'single-select-card' as const,
    question: sq.question,
    required: false,
    shuffleable: true,
    columns: 1 as const,
    multiSelect: MULTI_SELECT_SCENARIO_IDS.has(sq.id),
    options: sq.options.map(o => ({ value: o.value, label: o.label })),
  })),
];

export const ALL_QUESTIONS: Question[] = [
  ...FIXED_QUESTIONS,
  ...seededShuffle(SHUFFLEABLE_QUESTIONS, SHUFFLE_SEED),
];

export function getActiveQuestions(answers: AnswerMap): Question[] {
  return ALL_QUESTIONS.filter(q => !q.condition || q.condition(answers));
}

export function resolveAutofill(id: string, answers: AnswerMap): string {
  if (id === 'q_degree') {
    return getDegreeForProgram((answers.q_program_studied as string) ?? '');
  }
  return '';
}

export function buildPayload(answers: AnswerMap): AIAnalysisPayload {
  const group = (answers.q_group as string) as 'IT_STUDENT' | 'NYSC_CORP_MEMBER';
  const scenarioResponses: Record<string, string> = {};
  for (const sq of SCENARIO_QUESTIONS) {
    const v = answers[sq.id];
    if (!v) continue;
    // Multi-select answers are arrays — join for the AI prompt
    scenarioResponses[sq.id] = Array.isArray(v) ? v.join(' | ') : (v as string);
  }

  const base: AIAnalysisPayload = {
    respondentName: (answers.q_name as string) ?? '',
    respondentGroup: group,
    organizationDepartment: (answers.q_dept as string) ?? '',
    careerInterests: (answers.q_career_interests as string[]) ?? [],
    enjoyedSkills: (answers.q_skills as string[]) ?? [],
    workEnvironment: (answers.q_work_env as string) ?? '',
    primaryMotivation: (answers.q_motivation as string) ?? '',
    biggestStrength: (answers.q_strength as string) ?? '',
    shortTermGoal: (answers.q_short_goal as string) ?? '',
    longTermGoal: (answers.q_long_goal as string) ?? '',
    scenarioResponses,
    organizationRolePreference: (answers.q_org_role_type as string) ?? '',
    collaborationStyle: (answers.q_collab_style as string) ?? '',
  };

  if (group === 'IT_STUDENT') {
    base.schoolProgram = (answers.q_school_program as string) ?? '';
    base.expectedCompletionDate = (answers.q_completion_date as string) ?? '';
  } else {
    base.programStudied = (answers.q_program_studied as string) ?? '';
    base.degreeRequired = (answers.q_degree as string) ?? '';
    base.serviceEndDate = (answers.q_service_end as string) ?? '';
  }

  return base;
}
