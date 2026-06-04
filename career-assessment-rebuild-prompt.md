# Master Rebuild Prompt — Career Assessment Application
> Hand this entire document to your AI coding tool (GitHub Copilot, Cursor, Claude Code, etc.).  
> It is self-contained. No additional context is needed.

---

## 1. Project Identity

You are rebuilding a **Career Assessment Web Application** used by an organisation in Nigeria to onboard **IT Student interns** and **NYSC Corp Members**. The system collects psychographic and career data through a multi-step form and uses AI (Claude) to generate a personalised career guidance report at the end.

**Project name:** `career-assessment`  
**Deployment target:** Vercel (frontend + serverless functions on the same origin)  
**Database:** Neon Postgres (connected directly via `@neondatabase/serverless`, NOT via `@vercel/postgres`)

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend framework | React 19 + TypeScript (Vite scaffold) |
| Styling | Plain CSS with CSS custom properties — no Tailwind, no CSS-in-JS |
| Backend | Vercel Serverless Functions (Node.js, TypeScript) |
| Database | Neon Postgres via `@neondatabase/serverless` |
| AI integration | Anthropic Claude API (`claude-sonnet-4-20250514`) — server-side only |
| Deployment | Vercel |
| Package manager | npm |

---

## 3. Visual Design Direction — "Deep Futures" Dark Theme

The previous version had a plain, utilitarian interface. The rebuild must be **visually striking and memorable**. Execute the following design direction with precision.

### 3.1 Theme: "Deep Futures"

A sophisticated, high-contrast dark-mode interface inspired by the intersection of African professional ambition and modern technology. Think: mission control meets editorial magazine.

**Mood:** Confident. Purposeful. Refined. Ambitious.  
**NOT:** Generic SaaS purple gradient. Not playful. Not light.

### 3.2 Color Palette (CSS custom properties)

```css
:root {
  /* Backgrounds */
  --bg-base:       #080C14;   /* near-black, deep navy */
  --bg-surface:    #0F1623;   /* card/panel surfaces */
  --bg-elevated:   #161E2E;   /* hover states, elevated panels */
  --bg-overlay:    rgba(15, 22, 35, 0.92); /* modal/overlay backdrop */

  /* Primary accent — electric amber/gold */
  --accent-primary:   #F5A623;
  --accent-glow:      rgba(245, 166, 35, 0.18);
  --accent-muted:     rgba(245, 166, 35, 0.08);

  /* Secondary accent — cool cyan */
  --accent-secondary: #38BDF8;
  --accent-secondary-muted: rgba(56, 189, 248, 0.10);

  /* Text */
  --text-primary:   #F0F4FF;
  --text-secondary: #8B95AA;
  --text-tertiary:  #4A5568;
  --text-inverse:   #080C14;

  /* Borders */
  --border-subtle:  rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-accent:  rgba(245, 166, 35, 0.40);

  /* Status */
  --color-success: #34D399;
  --color-error:   #F87171;
  --color-warning: #FBBF24;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;

  /* Shadows */
  --shadow-card:   0 4px 24px rgba(0,0,0,0.5);
  --shadow-accent: 0 0 32px rgba(245, 166, 35, 0.12);
  --shadow-glow:   0 0 0 1px rgba(245, 166, 35, 0.25), 0 0 20px rgba(245, 166, 35, 0.08);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

### 3.3 Typography

- **Display / headings:** `"Clash Display"` — import from Fontshare (`https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap`). Use weight 600–700 for step titles and the landing header.
- **Body / UI text:** `"Satoshi"` — import from Fontshare (`https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap`). Use 400 for body, 500 for labels, 700 for button text.
- **Monospace (step numbers, auto-filled tags):** `"JetBrains Mono"` — from Google Fonts.
- **Base font size:** 16px. Line-height 1.6 for body, 1.2 for headings.
- **NEVER use:** Inter, Roboto, Arial, system-ui, or any generic fallback as a primary font.

### 3.4 Layout

- **Max content width:** 720px, centred on the page.
- **Progress bar:** A horizontal bar at the very top of the viewport, full-width, showing amber fill advancing from 0% to 100% across the 5 steps. Height 3px. Animate width transitions with `transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1)`.
- **Step card:** A single panel (`--bg-surface`, `--radius-xl`, `--shadow-card`) that contains the active step content. It slides in from the right on `Next` and from the left on `Back` using a CSS keyframe animation. Duration 280ms, ease-out.
- **No sidebar navigation.** The step indicator is a simple pill row above the card showing step number and label.
- **Background texture:** Apply a very subtle `background-image: radial-gradient(ellipse at 20% 40%, rgba(245,166,35,0.04) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(56,189,248,0.04) 0%, transparent 55%)` on `body`. This adds atmospheric depth without being distracting.

### 3.5 Component Aesthetics

**Form inputs (text, date, select):**
- Background: `--bg-elevated`
- Border: `1px solid var(--border-default)`
- Border-radius: `--radius-md`
- Padding: `12px 16px`
- Font: Satoshi 400, `--text-primary`
- On focus: border changes to `--border-accent`, box-shadow: `var(--shadow-glow)`. Transition 150ms.
- Placeholder: `--text-tertiary`

**Radio / option cards (for work environment, scenario questions):**  
Each option is a selectable card (not a raw `<input type="radio">`). Structure:
```
[ ○ ] Label text                              [subtle right arrow icon on hover]
```
- Unchecked: `--bg-elevated`, `--border-default`
- Checked: `background: var(--accent-muted)`, `border: 1px solid var(--border-accent)`, left border accent bar 3px wide in `--accent-primary`
- Hover: `--bg-elevated` lightens, subtle scale `1.005`
- Checkmark indicator: a small amber circle dot, not a native radio button

**Checkbox pills (career interests, enjoyed skills):**  
Each option is a compact pill/chip — NOT a native checkbox.
- Unchecked: `background: transparent`, `border: 1px solid var(--border-default)`, `--text-secondary`, border-radius 999px
- Checked: `background: var(--accent-muted)`, `border: 1px solid var(--accent-primary)`, `--text-primary`, with a small `✓` icon prepended
- Category headers above each group: uppercase, letter-spacing 0.08em, Satoshi 500, `--text-tertiary`, 11px

**Buttons:**
- Primary (`Next`, `Submit`): `background: var(--accent-primary)`, `color: var(--text-inverse)`, Satoshi 700, border-radius `--radius-md`, padding `14px 28px`. On hover: brightness 1.08, slight upward translate `–1px`, shadow intensifies. On active: scale 0.98.
- Secondary (`Back`): transparent background, `border: 1px solid var(--border-default)`, `--text-secondary`. On hover: `--border-accent`, `--text-primary`.
- Disabled state: opacity 0.4, cursor not-allowed, no hover effects.

**Step number pills (in the progress indicator row):**
- Completed steps: filled amber background, white checkmark, Satoshi 700
- Active step: outlined in amber, amber text
- Upcoming steps: `--bg-elevated`, `--text-tertiary`

**Auto-filled badge (degree field):**  
When degree is auto-resolved, render a pill badge: amber background at 15% opacity, amber border, amber text, `✦ Auto-filled` label in JetBrains Mono 12px. Animate in with a fade+scale entrance.

**Error messages:** Red (`--color-error`), 13px Satoshi 400, appear below the field with a fade-in animation. Preceded by a `⚠` icon.

**Hint text:** `--text-tertiary`, 13px, Satoshi 400, below label.

---

## 4. Application Structure

```
api/
└── assessments.ts          # POST /api/assessments — validate, store in Neon, call Claude AI
src/
├── components/
│   ├── AssessmentForm.tsx       # Root orchestrator: state, validation, step navigation, submission
│   ├── steps/
│   │   ├── Welcome.tsx          # Step 1 — name entry
│   │   ├── GroupSelection.tsx   # Step 2 — group cards (IT Student / NYSC)
│   │   ├── BasicInfo.tsx        # Step 3 — conditional group-specific fields
│   │   ├── SubtleQuestions.tsx  # Step 4 — scenario questions + interests/skills
│   │   └── Review.tsx           # Step 5 — review summary + submit button
│   ├── ui/
│   │   ├── ProgressBar.tsx          # Top viewport progress bar
│   │   ├── StepIndicator.tsx        # Pill-row step navigator
│   │   ├── FormField.tsx            # Label + children + error + hint wrapper
│   │   ├── OptionCard.tsx           # Styled radio option card
│   │   ├── PillCheckbox.tsx         # Styled checkbox pill
│   │   ├── CategorizedPillGroup.tsx # Category-grouped pill checkbox grid
│   │   └── AIResultPanel.tsx        # Renders the AI career guidance report
├── data/
│   ├── scenarioQuestions.ts
│   ├── programDegreeMapping.ts
│   ├── organizationDepartments.ts
│   └── nigerianUniversityPrograms.ts
├── types/
│   └── assessment.ts
├── App.css                    # All global styles + CSS custom properties
├── App.tsx
├── main.tsx
└── index.css                  # Minimal reset only
public/
└── favicon.svg
index.html
vercel.json
vite.config.ts
package.json
.env.example
```

---

## 5. TypeScript Types

### `src/types/assessment.ts`

```typescript
export type GroupType = 'IT_STUDENT' | 'NYSC_CORP_MEMBER';

export interface WelcomeFields {
  respondentName: string;
}

export interface CommonFields {
  organizationDepartment: string;
}

export interface ITStudentFields {
  schoolProgram: string;
  expectedCompletionDate: string;
}

export interface NYSCCorpMemberFields {
  programStudied: string;
  degreeRequired: string;   // auto-filled, editable
  serviceEndDate: string;
}

export interface InterestsAndSkillsFields {
  careerInterests: string[];
  enjoyedSkills: string[];
  workEnvironment: string;
  primaryMotivation: string;
  biggestStrength: string;
  shortTermGoal: string;
  longTermGoal: string;
  scenarioResponses: Record<string, string>;
}

export interface AssessmentFormData {
  respondentName: string;
  group: GroupType;
  common: CommonFields;
  itStudent: ITStudentFields;
  nyscCorpMember: NYSCCorpMemberFields;
  interestsAndSkills: InterestsAndSkillsFields;
}

/** Flat payload sent to POST /api/assessments and to the Claude AI model */
export interface AIAnalysisPayload {
  respondentName: string;
  respondentGroup: GroupType;
  organizationDepartment: string;

  // IT Student only
  schoolProgram?: string;
  expectedCompletionDate?: string;

  // NYSC only
  programStudied?: string;
  degreeRequired?: string;
  serviceEndDate?: string;

  // Interests & skills
  careerInterests: string[];
  enjoyedSkills: string[];
  workEnvironment: string;
  primaryMotivation: string;
  biggestStrength: string;
  shortTermGoal: string;
  longTermGoal: string;
  scenarioResponses: Record<string, string>;
}

export type ValidationErrors = Partial<
  Record<
    | keyof WelcomeFields
    | keyof CommonFields
    | keyof ITStudentFields
    | keyof NYSCCorpMemberFields
    | keyof InterestsAndSkillsFields
    | 'group',
    string
  >
>;

/** Shape returned by POST /api/assessments on success */
export interface SubmissionResult {
  id: string;
  submittedAt: string;
  aiReport: string;   // Full markdown string of the AI career guidance report
}
```

---

## 6. Data Files (copy these verbatim)

### 6.1 `src/data/organizationDepartments.ts`

Keep the following structure and extend with the full data from the original project:

```typescript
export interface OrganizationDepartmentGroup {
  group: string;
  departments: string[];
}

export const ORGANIZATION_DEPARTMENTS: OrganizationDepartmentGroup[] = [
  {
    group: 'MD',
    departments: ["MD's office", 'Procurement'],
  },
  {
    group: 'Engineering',
    departments: ['Technical services', 'Innovation', 'IT', 'SCC', 'NOC', 'Broadband'],
  },
  {
    group: 'Marketing and Admin',
    departments: ['Human capital management/HR', 'Account', 'Audit', 'Admin', 'Maintenance'],
  },
];

export interface CareerCategory {
  category: string;
  careers: string[];
}

// IMPORTANT: Include the FULL CAREER_INTEREST_CATEGORIES array from the original
// project — 14 categories: Technology & Engineering, Design & Product, Sciences,
// Health & Medicine, Social Sciences, Arts & Creative Industries, Communication &
// Media, Management & Strategy, Business & Finance, Law & Policy, Education &
// Training, Agriculture & Environment, Architecture & Built Environment,
// Hospitality & Tourism.

export const CAREER_INTEREST_CATEGORIES: CareerCategory[] = [
  /* ... full data from original ... */
];

// Also include: ENJOYED_SKILLS_OPTIONS (55 items), WORK_ENVIRONMENT_OPTIONS (4),
// PRIMARY_MOTIVATION_OPTIONS (20 items), BIGGEST_STRENGTH_OPTIONS (8 items)
// — all verbatim from the original.
```

### 6.2 `src/data/scenarioQuestions.ts`

Copy all 20 scenario questions verbatim from the original. Each has an `id`, `question`, and 5 `options` (each with `value` and `label`). The 20 question IDs are:

```
sq_problem_solving, sq_team_role, sq_free_saturday, sq_ideal_workday,
sq_pride_moment, sq_social_impact, sq_complexity, sq_feedback,
sq_communication, sq_risk_tolerance, sq_learning_style, sq_long_term_identity,
sq_tools_enjoy, sq_decision_making, sq_energy_drain, sq_side_project,
sq_achievement_type, sq_conflict_resolution, sq_new_skill, sq_work_rhythm
```

### 6.3 `src/data/programDegreeMapping.ts`

Copy verbatim from the original. Exports: `PROGRAM_DEGREE_MAP` (Record<string, string>), `getDegreeForProgram(program: string): string`, `PROGRAM_NAMES: string[]`.

### 6.4 `src/data/nigerianUniversityPrograms.ts`

Copy verbatim. Exports `NIGERIAN_UNIVERSITY_PROGRAM_LIST: string[]`.

---

## 7. Step-by-Step Component Specifications

### Step 1 — Welcome (`Welcome.tsx`)

**Visual:** Full-bleed step card. At the top of the card, a large display heading in Clash Display 700: **"Tell us who you are."** Sub-heading in Satoshi 400: *"This assessment helps us understand your career ambitions and provide personalised guidance."*

Below the heading, a horizontal rule styled as a thin amber gradient line (`background: linear-gradient(90deg, var(--accent-primary), transparent)`).

**Single field:** `Full Name` — a large, centred text input (font-size 20px). Placeholder: *"Your full name"*. Validation: required, min 2 characters.

**Entrance animation:** The heading fades + slides up on mount. Stagger the sub-heading 80ms later. Animate purely with CSS (`@keyframes slideUpFade`).

### Step 2 — Group Selection (`GroupSelection.tsx`)

**Visual:** Two large selection cards side by side (flex, gap 16px, each 50% width, stacks on mobile). Each card:
- Icon: a large outlined icon at the top (use inline SVG — a graduation cap for IT Student, a badge/shield for NYSC Corp Member)
- Title: Clash Display 600, 20px
- Description: Satoshi 400, 14px, `--text-secondary`
- Selected state: `--accent-muted` background, `--border-accent` border, amber glow shadow. A checkmark badge appears top-right corner on selection.
- Unselected state: `--bg-elevated`, `--border-default`
- Hover: soft amber glow, slight scale `1.02`

**No "Next" button yet — selecting a card auto-advances to Step 3 after a 200ms delay.**

Validation: group is required before advancing (show error below the cards if somehow skipped).

### Step 3 — Basic Info (`BasicInfo.tsx`)

**Layout:** Standard vertical form field stack, 24px gap between fields.

**Department field:** A styled `<select>` with `<optgroup>` for each group (MD, Engineering, Marketing and Admin). Render as a fully custom-styled dropdown using the CSS-styled `<select>` approach (do not use a custom JS dropdown component — keep it native but visually styled).

**IT Student fields (conditional):**
- `Programme / Department in school` — styled `<select>` populated from `NIGERIAN_UNIVERSITY_PROGRAM_LIST`
- `Expected completion date` — styled `<input type="date">`. Custom calendar icon via CSS background-image.

**NYSC Corp Member fields (conditional):**
- `Programme studied` — `<input type="text">` with `<datalist>` autocomplete from `PROGRAM_NAMES`. Placeholder: *"E.g. Computer Science, Law, Accounting"*
- `Degree required` — `<input type="text">` that is auto-filled when programme is recognised. Show the amber **"✦ Auto-filled"** badge when auto-filled. Show a warning pill `"⚠ Not recognised — enter manually"` if programme is typed but unrecognised. Both pills animate in with a 200ms fade+scale entrance.
- `Service end date` — styled `<input type="date">`

**Auto-fill logic:** Use `useEffect` watching `nyscCorpMember.programStudied`. On change, call `getDegreeForProgram()` and update `degreeRequired`. Preserve the ability for the user to manually override.

### Step 4 — Interests & Skills (`SubtleQuestions.tsx`)

This is the longest step. Divide it into clearly labelled sub-sections with visual dividers:

**Sub-section 1 — Scenario Questions**  
Heading: *"20 Scenario Questions"* in Clash Display 600.  
Sub-heading: *"Read each scenario. Pick the response that comes most naturally — there are no right answers."*

Layout: Each question in its own card (`--bg-elevated`, `--radius-lg`, padding 20px 24px). Question text in Satoshi 500 16px. Options rendered as `OptionCard` components (radio-style cards). Questions 1–20 are all displayed stacked vertically (no pagination). Answered questions show a subtle green top-border highlight and a faint `✓` indicator in the top-right corner.

Scenario questions are **optional** (they enrich the AI report but are not required for submission).

**Sub-section 2 — Career Interests**  
Heading: *"Career Interests"*. Instruction: *"Select all areas that genuinely excite you."*  
Render as `CategorizedPillGroup` — each of the 14 career categories gets a bold uppercase category label, then a flex-wrap grid of pill checkboxes. At least 1 selection required.

**Sub-section 3 — Skills You Enjoy**  
Heading: *"Skills You Enjoy"*. Instruction: *"Think about what comes naturally and energises you — not just what you are good at."*  
Render as a flat `PillCheckbox` grid (2 columns on desktop, 1 on mobile). All 55 skills. At least 1 selection required.

**Sub-section 4 — Working Style**  
Render four fields stacked:
1. **Preferred work environment** — 4 `OptionCard` choices: Fully remote / Hybrid / On-site / Flexible.
2. **What motivates you most?** — styled `<select>` from `PRIMARY_MOTIVATION_OPTIONS` (20 options). Required.
3. **Your biggest strength** — styled `<select>` from `BIGGEST_STRENGTH_OPTIONS` (8 options). Required.
4. **Short-term goal (1–2 years)** — `<textarea>` rows=3. Placeholder: *"E.g. Land a junior software engineer role and build my first production project."* Required.
5. **Long-term goal (5+ years)** — `<textarea>` rows=3. Placeholder: *"E.g. Lead a product team at an African tech company or start my own venture."* Required.

### Step 5 — Review (`Review.tsx`)

**Layout:** A clean read-only summary of all collected data.

Sections:
1. **Identity** — Name, group (shown as a badge), department
2. **Background** — Programme/degree info, dates
3. **Interests** — Career interests as pill tags (amber-tinted), enjoyed skills as pill tags (cyan-tinted)
4. **Working style** — Work environment, motivation, strength as labelled rows
5. **Goals** — Short-term and long-term as blockquote-style blocks
6. **Scenario responses** — A collapsible section (closed by default) showing the question text and chosen answer for all answered scenarios. Toggle with a styled button: *"View scenario answers (N answered)"*

At the bottom: a large amber **"Submit & Get Your Career Report →"** button. Below it in small muted text: *"Your responses are saved privately. Your personalised report will be generated in about 10–15 seconds."*

Loading state after submission: Replace the button with an animated pulse indicator and the text *"Generating your career report…"*. Show an amber spinner (CSS-only, `@keyframes spin`). Do NOT navigate away — show the result inline on this same page.

---

## 8. AI Result Panel (`AIResultPanel.tsx`)

After successful submission, replace the entire step card content with the AI result panel. **Do not navigate to a new page.**

**Layout:**
- A large success header: amber checkmark icon, "Your Career Report is Ready" in Clash Display 700
- The respondent's name in a sub-heading: *"Here's what we found for [Name]"*
- The AI-generated report rendered as formatted markdown. Use a simple markdown renderer (you may implement a minimal one inline, or use `react-markdown` as a dependency).
- A horizontal divider below the report
- A row of two action buttons:
  - **"Save as PDF"** — triggers `window.print()` with a print-specific CSS `@media print` that shows only the report content cleanly styled on a white background
  - **"Start a new assessment"** — resets all state and returns to Step 1

The report panel itself: white or near-white background (`#F9FAFB`) with dark text for readability. This is intentionally a contrast break from the dark theme — it makes the report feel like a deliverable document.

---

## 9. State Management (`AssessmentForm.tsx`)

Manage all state in `AssessmentForm.tsx` with `useState`. No external state library.

```typescript
// State shape
const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
const [formData, setFormData] = useState<AssessmentFormData>(INITIAL_FORM_DATA);
const [errors, setErrors] = useState<ValidationErrors>({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
const [submissionError, setSubmissionError] = useState<string | null>(null);
```

**Navigation:**
- `handleNext()`: validate the current step, update errors, advance step on success
- `handleBack()`: decrement step, clear errors for fields on that step
- `handleGroupSelect(group)`: set group, auto-advance to step 3 after 200ms
- `handleSubmit()`: validate step 5, set `isSubmitting = true`, POST to `/api/assessments`, handle response

**Validation rules per step:**

Step 1: `respondentName` — required, min 2 chars  
Step 2: `group` — required  
Step 3 (IT_STUDENT): `organizationDepartment`, `schoolProgram`, `expectedCompletionDate` — all required  
Step 3 (NYSC_CORP_MEMBER): `organizationDepartment`, `programStudied`, `degreeRequired`, `serviceEndDate` — all required  
Step 4: `careerInterests` (min 1), `enjoyedSkills` (min 1), `workEnvironment`, `primaryMotivation`, `biggestStrength`, `shortTermGoal`, `longTermGoal` — all required  
Step 5: No additional fields — this is review only. The submit button triggers final submission.

**Payload builder:**

```typescript
function buildAIPayload(data: AssessmentFormData): AIAnalysisPayload {
  const base = {
    respondentName: data.respondentName,
    respondentGroup: data.group,
    organizationDepartment: data.common.organizationDepartment,
    careerInterests: data.interestsAndSkills.careerInterests,
    enjoyedSkills: data.interestsAndSkills.enjoyedSkills,
    workEnvironment: data.interestsAndSkills.workEnvironment,
    primaryMotivation: data.interestsAndSkills.primaryMotivation,
    biggestStrength: data.interestsAndSkills.biggestStrength,
    shortTermGoal: data.interestsAndSkills.shortTermGoal,
    longTermGoal: data.interestsAndSkills.longTermGoal,
    scenarioResponses: data.interestsAndSkills.scenarioResponses,
  };

  if (data.group === 'IT_STUDENT') {
    return { ...base, schoolProgram: data.itStudent.schoolProgram, expectedCompletionDate: data.itStudent.expectedCompletionDate };
  }

  return { ...base, programStudied: data.nyscCorpMember.programStudied, degreeRequired: data.nyscCorpMember.degreeRequired, serviceEndDate: data.nyscCorpMember.serviceEndDate };
}
```

---

## 10. Backend — `api/assessments.ts`

### 10.1 Dependencies

```
@neondatabase/serverless
@anthropic-ai/sdk
@vercel/node
```

### 10.2 Environment Variables

```env
DATABASE_URL=postgres://...        # Neon direct connection string
ANTHROPIC_API_KEY=sk-ant-...
```

### 10.3 Full Handler Logic

```typescript
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

// ─── Database setup ──────────────────────────────────────────────────────────

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

// ─── Claude AI report generation ─────────────────────────────────────────────

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
A closing 1–paragraph personal message directly addressing ${name} by first name. Warm, motivating, specific. End with one powerful question for them to reflect on.

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

// ─── Validation ───────────────────────────────────────────────────────────────

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
    return `Invalid respondentGroup value`;
  }
  return null;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  // Payload size guard
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
    // Run DB setup and AI generation in parallel
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
```

---

## 11. Configuration Files

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

### `vercel.json`

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }]
}
```

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Career Assessment</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://api.fontshare.com" />
    <link
      href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=satoshi@400,500,700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `package.json` (key dependencies)

```json
{
  "name": "career-assessment",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "dev:frontend": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@neondatabase/serverless": "^0.10.4",
    "@vercel/node": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.7.2",
    "vite": "^6.0.5"
  }
}
```

### `.env.example`

```env
# Neon Postgres — direct connection string from Neon dashboard
DATABASE_URL=postgres://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require

# Anthropic API key — https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 12. CSS Architecture (`src/App.css`)

Structure the CSS in the following order:

1. **CSS custom properties** (`:root` block — full palette as specified in Section 3.2)
2. **CSS reset** (minimal: `*, *::before, *::after { box-sizing: border-box }`, margin/padding resets, `html { -webkit-font-smoothing: antialiased }`)
3. **Base styles** (`body`, `html` — background, font, color)
4. **Keyframe animations** — define all animations here:
   - `@keyframes slideUpFade` — translate Y 20px → 0, opacity 0 → 1
   - `@keyframes slideInRight` — translate X 40px → 0, opacity 0 → 1
   - `@keyframes slideInLeft` — translate X -40px → 0, opacity 0 → 1
   - `@keyframes fadeIn` — opacity 0 → 1
   - `@keyframes scalePop` — scale 0.92 → 1, opacity 0 → 1
   - `@keyframes spin` — rotate 0deg → 360deg
   - `@keyframes pulse` — opacity 1 → 0.4 → 1
5. **Layout** (`.app-root`, `.form-wrapper`, `.step-card`)
6. **Progress bar** (`.progress-bar`, `.progress-bar__fill`)
7. **Step indicator** (`.step-indicator`, `.step-pill`, `.step-pill--active`, `.step-pill--done`)
8. **Form base** (`.form-field`, `.form-label`, `.form-hint`, `.form-error`, `input`, `select`, `textarea`)
9. **Option cards** (`.option-card`, `.option-card--selected`, `.option-card__indicator`)
10. **Pill checkboxes** (`.pill`, `.pill--selected`, `.category-label`)
11. **Group selection cards** (`.group-card`, `.group-card--selected`)
12. **Buttons** (`.btn-primary`, `.btn-secondary`, `.btn-icon`)
13. **Auto-fill badge** (`.badge-autofill`, `.badge-warning`)
14. **Scenario question card** (`.scenario-card`, `.scenario-card--answered`)
15. **Review section** (`.review-section`, `.review-row`, `.review-tag`, `.review-goal`)
16. **AI result panel** (`.ai-result`, `.ai-result__header`, `.ai-result__report`)
17. **Print styles** (`@media print`)
18. **Responsive breakpoints** (`@media (max-width: 640px)` — stack group cards, single-column pills, full-width buttons)

---

## 13. Responsive Design Rules

- All content max-width: 720px, centred with auto horizontal margins
- Group selection cards: side-by-side on ≥500px, stacked below
- Pill checkbox grid: 3–4 columns on ≥640px, 2 columns on 400–639px, 1 column below 400px
- Skills grid: 2 columns on ≥500px, 1 column below
- Scenario option cards: full width always
- Step indicator: hide labels below 480px, show only step numbers
- Font sizes: reduce `h1` from 36px to 26px on mobile, step titles from 28px to 22px

---

## 14. Accessibility Requirements

- All interactive elements reachable via keyboard (`Tab`)
- Custom radio/checkbox replacements must use `role="radio"` / `role="checkbox"` with `aria-checked` and respond to `Space` key
- All form fields have associated `<label>` (via `htmlFor`) or `aria-label`
- Error messages linked to fields via `aria-describedby`
- Step transitions respect `prefers-reduced-motion` — use `@media (prefers-reduced-motion: reduce)` to disable slide animations (use instant swap instead)
- Colour contrast: all text meets WCAG AA minimum against its background

---

## 15. Deployment Checklist

1. `npm install`
2. Create a Neon Postgres project at [console.neon.tech](https://console.neon.tech) — copy the **direct connection string** (not pooled)
3. Get Anthropic API key at [console.anthropic.com](https://console.anthropic.com)
4. `vercel login && vercel link`
5. In Vercel dashboard → Settings → Environment Variables, add:
   - `DATABASE_URL` — Neon connection string
   - `ANTHROPIC_API_KEY` — Anthropic key
6. `vercel deploy --prod`
7. On first form submission, `CREATE TABLE IF NOT EXISTS` runs automatically — no manual migration needed.

---

## 16. Critical Implementation Notes

1. **Neon vs @vercel/postgres:** Use `@neondatabase/serverless` directly. Do NOT use `@vercel/postgres`. Import: `import { neon } from '@neondatabase/serverless'`. Initialise: `const sql = neon(process.env.DATABASE_URL!)`. This is the correct pattern for Neon direct connections in serverless functions.

2. **AI call on the server only:** The Anthropic API key must never be exposed to the frontend. The entire `generateAIReport()` function lives in `api/assessments.ts`. The frontend receives the `aiReport` string in the `201` response body and renders it.

3. **No Google Sheets:** The original project had a Google Sheets fallback. Do not implement this. Neon Postgres is the sole storage backend.

4. **Scenario questions are optional enrichment:** Do not block form submission if scenario questions are not all answered. They provide richer AI context but are not required.

5. **Step transition direction:** Track the previous step to determine slide direction. Moving forward → slide in from right. Moving backward → slide in from left. Implement via a state variable `slideDirection: 'forward' | 'back'` and swap CSS class on the step card.

6. **Font loading:** The Fontshare and Google Fonts links are in `index.html`. Do not try to load them from JS. Ensure both font families are referenced in CSS before any component-level font usage.

7. **react-markdown:** Use `react-markdown` to render the `aiReport` string in `AIResultPanel.tsx`. The AI report will contain markdown headings, bold text, and bullet lists. Pass a `components` prop to override default heading and link styles to match the light report panel theme.

8. **Print style:** `@media print` should: hide everything except `.ai-result__report`, set background to white, set text to black, expand to full width. This allows *"Save as PDF"* via `window.print()` to produce a clean document.

9. **Error resilience:** If the AI call fails but DB insert would succeed (or vice versa), return a `500` with a descriptive message. Do not partially succeed silently. The frontend should display the error message from `detail` in a styled error banner with a "Try again" button.

10. **CORS:** Not needed — on Vercel, the frontend and API functions share the same origin. Do not add CORS headers.

---

*End of master prompt. Begin implementation.*
