# Career Assessment Application — Project Logbook

**Project Name:** Career Assessment Web Application  
**Version:** 1.0.0  
**Deployment Target:** Vercel  
**Repository:** github.com/moladeji2302025-ctrl/New-Career-Assessment  
**Date Documented:** June 2026  

---

## Table of Contents

1. [What This Application Does](#1-what-this-application-does)
2. [Technology Stack](#2-technology-stack)
3. [How the Application Works — User Journey](#3-how-the-application-works--user-journey)
4. [Project Folder Structure](#4-project-folder-structure)
5. [File-by-File Breakdown](#5-file-by-file-breakdown)
   - [Configuration Files](#51-configuration-files)
   - [Type Definitions](#52-type-definitions)
   - [Data Files](#53-data-files)
   - [Frontend Components](#54-frontend-components)
   - [Backend API](#55-backend-api)
   - [Styles](#56-styles)
6. [Data Flow — From Form to AI Report](#6-data-flow--from-form-to-ai-report)
7. [Database Schema](#7-database-schema)
8. [AI Integration](#8-ai-integration)
9. [Environment Variables](#9-environment-variables)
10. [Deployment](#10-deployment)
11. [Key Design Decisions](#11-key-design-decisions)

---

## 1. What This Application Does

This is a **Career Assessment Web Application** designed for an organisation in Nigeria that onboards two categories of people:

- **IT Students** — university students on their mandatory Industrial Training (IT) internship
- **NYSC Corp Members** — graduates serving their mandatory National Youth Service Corps year

When a new intern or corp member joins the organisation, they are directed to this web app. They fill out a multi-step form that collects:
- Their name and role type
- Their assigned department within the organisation
- Their academic background (programme studied, degree, dates)
- Their career interests and skills they enjoy
- Their working style preferences
- Their short-term and long-term career goals
- Responses to 20 psychographic scenario questions

After completing the form, the application sends all collected data to **Claude (Anthropic's AI)**, which generates a personalised, multi-section career guidance report tailored specifically to that individual. The report covers their career personality profile, top career matches, a 90-day action plan, skills to develop, and a motivational message.

All submissions and reports are stored in a **Neon PostgreSQL database** for the organisation's records.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | Builds the interactive user interface |
| **Build Tool** | Vite | Fast development server and production bundler |
| **Styling** | Plain CSS with CSS Custom Properties | All visual design — no external UI libraries |
| **Backend** | Vercel Serverless Functions (Node.js) | Handles form submissions on the server |
| **Database** | Neon PostgreSQL via `@neondatabase/serverless` | Stores all assessment submissions and AI reports |
| **AI Integration** | Anthropic Claude API (`claude-sonnet-4-6`) | Generates personalised career guidance reports |
| **Deployment** | Vercel | Hosts both the frontend and the backend API |
| **Package Manager** | npm | Installs and manages all dependencies |
| **Language** | TypeScript throughout | Type safety across both frontend and backend |

### Fonts Used
- **Clash Display** (via Fontshare) — headings and question text
- **Satoshi** (via Fontshare) — body text, labels, buttons
- **JetBrains Mono** (via Google Fonts) — question counters, code-like elements

---

## 3. How the Application Works — User Journey

The application presents **one question at a time**, with each question occupying its own full-screen card. The user navigates forward through all questions and then arrives at a Review page before submitting.

### Step-by-Step Flow

```
[Question 1] Name
      ↓
[Question 2] Group — IT Student or NYSC Corp Member
      ↓
[Question 3] Department
      ↓
[Questions 4–5] Group-specific background info
  (IT Student: Programme + Completion Date)
  (NYSC: Programme Studied + Degree + Service End Date)
      ↓
[Questions 6–32] Shuffled questions (same order for every user):
  - Career interests (multi-select)
  - Skills enjoyed (multi-select)
  - Work environment preference
  - Primary motivation
  - Biggest strength
  - Short-term goal (1–2 years)
  - Long-term goal (5–10 years)
  - 20 scenario/psychographic questions
      ↓
[Review Page] — Summary of all answers, collapsible scenario section
      ↓
[Submit] → API call → Neon DB + Claude AI
      ↓
[AI Result Panel] — Full personalised career report displayed inline
```

### Key UX Behaviours

- **Progress bar** at the very top of the screen fills from left to right as the user advances
- **Question counter** (e.g. "7 / 32") shown in the top-left of every question card
- **Single-select card questions** auto-advance the moment the user picks an option (no button click needed)
- **Multi-select questions** (career interests, skills, applicable scenario questions) show a "Continue" button
- **Optional questions** display an "Optional" badge — the user can skip them
- **Page refresh resilience** — progress is saved to the browser's localStorage so refreshing the page does not lose answers
- **Auto-fill** — for NYSC corp members, when they type their programme (e.g. "Computer Science"), the degree field fills in automatically (e.g. "B.Sc. Computer Science")
- **Seeded shuffle** — the 27 shuffleable questions are in a randomised but fixed order (the same for every single user, determined by a seed number)

---

## 4. Project Folder Structure

```
New Career Assessment/
│
├── api/
│   └── assessments.ts          ← Backend serverless function (POST /api/assessments)
│
├── public/
│   └── favicon.svg             ← Browser tab icon (amber triangle)
│
├── src/
│   ├── components/
│   │   ├── AssessmentForm.tsx  ← Root orchestrator: manages all state and navigation
│   │   ├── QuestionPage.tsx    ← Renders a single question card
│   │   ├── ReviewPage.tsx      ← Final review + submit screen
│   │   │
│   │   ├── steps/              ← Legacy step components (not used in current version)
│   │   │   ├── Welcome.tsx
│   │   │   ├── GroupSelection.tsx
│   │   │   ├── BasicInfo.tsx
│   │   │   ├── SubtleQuestions.tsx
│   │   │   └── Review.tsx
│   │   │
│   │   └── ui/
│   │       ├── ProgressBar.tsx           ← Top viewport progress bar
│   │       ├── StepIndicator.tsx         ← Step pill navigation (legacy)
│   │       ├── FormField.tsx             ← Label + input + error wrapper
│   │       ├── OptionCard.tsx            ← Styled radio card (legacy)
│   │       ├── PillCheckbox.tsx          ← Toggleable pill/chip button
│   │       ├── CategorizedPillGroup.tsx  ← Grouped career interest selector
│   │       └── AIResultPanel.tsx         ← Renders the final AI career report
│   │
│   ├── data/
│   │   ├── questionBank.ts               ← All questions + shuffle logic + payload builder
│   │   ├── organizationDepartments.ts   ← Departments, career categories, skills, motivations
│   │   ├── scenarioQuestions.ts         ← 20 psychographic scenario questions
│   │   ├── programDegreeMapping.ts      ← Maps university programmes → degrees
│   │   └── nigerianUniversityPrograms.ts ← Full list of Nigerian university programmes
│   │
│   ├── types/
│   │   ├── assessment.ts    ← TypeScript types for form data and API payloads
│   │   └── question.ts      ← TypeScript types for the question system
│   │
│   ├── App.css      ← All application styles (design system + component styles)
│   ├── App.tsx      ← Root React component (just renders AssessmentForm)
│   ├── index.css    ← Minimal CSS reset (box-sizing, margin, padding)
│   └── main.tsx     ← Entry point — mounts React app into the HTML page
│
├── .env.example         ← Template showing required environment variables
├── .gitignore           ← Tells Git what not to track (node_modules, .env, etc.)
├── index.html           ← The single HTML page — loads fonts and the React app
├── package.json         ← Lists all dependencies and npm scripts
├── package-lock.json    ← Exact locked versions of every dependency
├── tsconfig.json        ← TypeScript configuration (references app + node configs)
├── tsconfig.app.json    ← TypeScript config for the React frontend
├── tsconfig.node.json   ← TypeScript config for Vite configuration file
└── vercel.json          ← Tells Vercel how to route API requests
```

---

## 5. File-by-File Breakdown

---

### 5.1 Configuration Files

---

#### `index.html`
**What it is:** The single HTML file that the browser loads first.  
**What it does:**
- Sets the page language to English and the character encoding to UTF-8
- Sets the viewport for proper display on mobile devices
- Sets the browser tab title: "Career Assessment"
- Links the amber triangle favicon
- Loads the **Clash Display** and **Satoshi** fonts from Fontshare
- Loads the **JetBrains Mono** font from Google Fonts
- Contains a single `<div id="root">` — React mounts the entire application into this div
- Loads the React application via `src/main.tsx`

---

#### `package.json`
**What it is:** The project's dependency manifest.  
**What it does:** Lists every library the project depends on and defines the available commands.

**Production dependencies** (needed when the app runs):
| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.0.0 | The core React library |
| `react-dom` | ^19.0.0 | React's renderer for web browsers |
| `react-markdown` | ^9.0.1 | Renders the AI report (which is Markdown text) as formatted HTML |
| `@anthropic-ai/sdk` | ^0.39.0 | Official Anthropic SDK for calling the Claude AI API |
| `@neondatabase/serverless` | ^0.10.4 | Connects to Neon PostgreSQL database from serverless functions |
| `@vercel/node` | ^5.0.0 | Type definitions for Vercel serverless function request/response objects |

**Development dependencies** (only needed during development/build):
| Package | Purpose |
|---|---|
| `typescript` | TypeScript compiler |
| `vite` | Development server and production builder |
| `@vitejs/plugin-react` | Vite plugin that enables React/JSX support |
| `@types/react`, `@types/react-dom` | TypeScript type definitions for React |

**Scripts:**
- `npm run dev` — starts the local development server
- `npm run build` — compiles TypeScript and builds production files
- `npm run preview` — previews the built production files locally

---

#### `vite.config.ts`
**What it is:** Vite build tool configuration.  
**What it does:** Tells Vite to use the React plugin, which enables JSX transformation and React Fast Refresh (live reloading during development).

---

#### `vercel.json`
**What it is:** Vercel deployment configuration.  
**What it does:** Contains a single routing rule: any request to `/api/*` is forwarded to the corresponding file in the `api/` folder. This is what makes `/api/assessments` work as a backend endpoint.

---

#### `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
**What they are:** TypeScript compiler configuration files.  
**What they do:**
- `tsconfig.json` — the root config that references the other two
- `tsconfig.app.json` — controls TypeScript for all frontend code in `src/`. Enables strict mode (catches more potential bugs), sets JSX to React mode, and targets modern browsers (ES2020)
- `tsconfig.node.json` — controls TypeScript for `vite.config.ts` only. Uses a more modern target (ES2022) suitable for Node.js

---

#### `.gitignore`
**What it is:** A list of files and folders Git should never track or commit.  
**What it contains:**
- `node_modules/` — the installed packages folder (huge, reproducible with `npm install`)
- `dist/` — the production build output (reproducible with `npm run build`)
- `.env` / `.env.local` — files containing real secret keys (never commit secrets)
- `.vercel` — Vercel local configuration
- `*.tsbuildinfo` — TypeScript build cache files

---

#### `.env.example`
**What it is:** A template showing what environment variables must be set.  
**What it contains:**
```
DATABASE_URL=postgres://...    ← The Neon PostgreSQL direct connection string
ANTHROPIC_API_KEY=sk-ant-...   ← The Anthropic API key for Claude
```
This file is safe to commit because it contains no real values — it is a guide for anyone setting up the project. The real `.env` file (with actual secrets) is never committed.

---

### 5.2 Type Definitions

---

#### `src/types/assessment.ts`
**What it is:** TypeScript type definitions for the assessment data structures.  
**What it does:** Defines the "shape" of data objects used throughout the application.

**Key types defined:**

- **`GroupType`** — A union type that can only be `'IT_STUDENT'` or `'NYSC_CORP_MEMBER'`. Used everywhere to represent which group a respondent belongs to.

- **`AssessmentFormData`** — The complete nested object that stores all form data:
  - `respondentName` — the person's full name
  - `group` — their GroupType
  - `common` — fields shared by both groups (department)
  - `itStudent` — IT Student-specific fields (school programme, completion date)
  - `nyscCorpMember` — NYSC-specific fields (programme studied, degree, service end date)
  - `interestsAndSkills` — all psychographic data (interests, skills, goals, scenario responses)

- **`AIAnalysisPayload`** — The flattened object sent to the backend API. It collapses the nested `AssessmentFormData` into a single flat object suitable for JSON transmission and AI analysis.

- **`ValidationErrors`** — A partial record of field names mapped to error message strings. When validation fails, this object is populated with messages like `{ respondentName: "Please enter your full name" }`.

- **`SubmissionResult`** — The object returned by the API on success: `id` (unique submission ID), `submittedAt` (timestamp), and `aiReport` (the full Markdown text of the AI report).

---

#### `src/types/question.ts`
**What it is:** TypeScript type definitions for the dynamic question system.  
**What it does:** Defines how questions are structured, enabling the one-question-per-page system.

**Key types defined:**

- **`QuestionType`** — An enumeration of all possible input types a question can use:
  - `'text'` — a plain text input
  - `'text-autofill'` — text input with browser datalist suggestions
  - `'single-select-card'` — clickable option cards (radio-style or checkbox-style)
  - `'single-select-dropdown'` — a native `<select>` dropdown
  - `'multi-select-pill'` — a grid of toggleable pill/chip buttons
  - `'categorized-multi-select'` — pill grid organised by category headers
  - `'date'` — a date picker input
  - `'textarea'` — a multi-line text area

- **`AnswerValue`** — Either a `string` (single answers) or `string[]` (multi-select answers)

- **`AnswerMap`** — A dictionary mapping question IDs to their answer values. This is the primary state object: `{ q_name: "John Doe", q_group: "IT_STUDENT", q_career_interests: ["Software Engineering", "Data Science"] }`

- **`QuestionOption`** — An option within a question: has a `value` (what gets stored), a `label` (what the user sees), and an optional `description` (subtitle text shown below the label)

- **`Question`** — The complete definition of a single question, including its ID, type, question text, hint, whether it's required, whether it can be shuffled, any conditional display logic, its options, and input-specific properties

---

### 5.3 Data Files

---

#### `src/data/questionBank.ts`
**What it is:** The central brain of the question system. The most important data file.  
**What it does:** Defines every question in the assessment, implements the shuffle algorithm, and builds the API payload from answers.

**Key contents:**

**`SHUFFLE_SEED = 20250101`**  
A fixed number used as the seed for the shuffle algorithm. Because this seed never changes, every user who takes the assessment sees the shuffleable questions in the exact same randomised order. This is intentional — it ensures consistency across all respondents.

**`seededShuffle(arr, seed)`**  
A deterministic shuffle function using a Linear Congruential Generator (LCG) algorithm. Given the same array and the same seed, it always produces the same shuffled result. This is how the questions are shuffled identically for every user.

**`MULTI_SELECT_SCENARIO_IDS`**  
A Set containing the IDs of scenario questions that allow multiple answers. Currently includes:
- `sq_energy_drain` — what drains your energy (multiple things can drain you)
- `sq_free_saturday` — how you spend free time (you can do multiple things)
- `sq_tools_enjoy` — which tools you use (you can use multiple types)
- `sq_side_project` — what side project you'd start (you may have multiple ideas)
- `sq_achievement_type` — what achievement feels meaningful (multiple can apply)
- `sq_new_skill` — what training you'd request (multiple skills may be desired)

**`FIXED_QUESTIONS` array**  
The 8 questions that always appear in the same fixed positions:
1. `q_name` — Full name (text input)
2. `q_group` — IT Student or NYSC Corp Member (two large cards)
3. `q_dept` — Department selection (dropdown with option groups)
4. `q_school_program` — School programme (dropdown) — *only shown for IT Students*
5. `q_completion_date` — Expected completion date — *only shown for IT Students*
6. `q_program_studied` — Programme studied at university — *only shown for NYSC*
7. `q_degree` — Degree obtained (auto-fills from programme) — *only shown for NYSC*
8. `q_service_end` — NYSC service end date — *only shown for NYSC*

Questions 4–8 use a `condition` function — they only appear if the user selected the appropriate group in Question 2.

**`SHUFFLEABLE_QUESTIONS` array**  
The 27 questions that get shuffled:
- `q_career_interests` — Categorised multi-select of all career fields (14 categories, 100+ options)
- `q_skills` — Multi-select of 55 skills/activities that energise the respondent
- `q_work_env` — 4-option card for work environment preference
- `q_motivation` — Dropdown of 20 motivation options
- `q_strength` — 8-option card for biggest professional strength
- `q_short_goal` — Textarea for 1–2 year goal
- `q_long_goal` — Textarea for 5–10 year goal
- 20 scenario questions (from `scenarioQuestions.ts`)

**`ALL_QUESTIONS`**  
The final complete question list: `FIXED_QUESTIONS` + shuffled `SHUFFLEABLE_QUESTIONS`. This is computed once when the module loads and never changes.

**`getActiveQuestions(answers)`**  
Filters `ALL_QUESTIONS` to only include questions whose `condition` is satisfied by the current answers. For example, if `answers.q_group === 'NYSC_CORP_MEMBER'`, the IT Student questions are excluded and the NYSC questions are included. Called every time the answers change.

**`resolveAutofill(id, answers)`**  
Checks if a question has auto-fill logic. Currently used for `q_degree`: when the user types their programme, this function calls `getDegreeForProgram()` to look up the expected degree.

**`buildPayload(answers)`**  
Converts the flat `AnswerMap` into the structured `AIAnalysisPayload` object that the API expects. It maps question IDs to their corresponding field names, handles the group-specific fields, and converts multi-select scenario responses from arrays to pipe-separated strings (e.g. `"a | b | c"`) for the AI prompt.

---

#### `src/data/organizationDepartments.ts`
**What it is:** All static option data for the organisation-specific and psychographic questions.  
**What it contains:**

- **`ORGANIZATION_DEPARTMENTS`** — Three groups (MD, Engineering, Marketing and Admin) each containing their department names. Used to populate the department dropdown with `<optgroup>` separators.

- **`CAREER_INTEREST_CATEGORIES`** — 14 career categories, each containing a list of specific career paths. All 14 categories are:
  Technology & Engineering, Design & Product, Sciences, Health & Medicine, Social Sciences, Arts & Creative Industries, Communication & Media, Management & Strategy, Business & Finance, Law & Policy, Education & Training, Agriculture & Environment, Architecture & Built Environment, Hospitality & Tourism.
  Together these contain over 100 distinct career options.

- **`ENJOYED_SKILLS_OPTIONS`** — An array of 55 skills/activities (e.g. "Coding / Programming", "Public Speaking", "Data Visualisation", "Event Planning") that respondents can select to indicate what energises them.

- **`WORK_ENVIRONMENT_OPTIONS`** — Four options: Fully remote, Hybrid, On-site, Flexible.

- **`PRIMARY_MOTIVATION_OPTIONS`** — 20 career motivation statements (e.g. "Financial security and wealth building", "Making a meaningful social impact", "Building something of my own").

- **`BIGGEST_STRENGTH_OPTIONS`** — 8 strength descriptions, each formatted as "Strength name — Brief description". The question bank splits these on " — " to create the card label and subtitle.

---

#### `src/data/scenarioQuestions.ts`
**What it is:** All 20 psychographic scenario questions.  
**What it contains:** Each question has an `id`, a `question` string, and exactly 5 `options` (each with a `value` and a `label`). The questions are designed to reveal the respondent's working style, personality, and professional preferences without asking directly.

**The 20 questions cover:**
- Problem solving approach
- Natural team role
- How they spend free time
- Ideal workday
- What makes them proud
- Social impact priority
- How they handle complexity
- Response to critical feedback
- Communication style
- Risk tolerance (stability vs startup)
- Learning style
- Long-term professional identity
- Preferred tools
- Decision-making process
- What drains their energy *(multi-select)*
- Type of side project they'd start *(multi-select)*
- What achievement type matters most *(multi-select)*
- Conflict resolution approach
- What skill development they'd request *(multi-select)*
- Natural work rhythm

---

#### `src/data/programDegreeMapping.ts`
**What it is:** A lookup table mapping Nigerian university programme names to their standard degree titles.  
**What it contains:**

- **`PROGRAM_DEGREE_MAP`** — A dictionary with ~65 entries, e.g.:
  - `"Computer Science"` → `"B.Sc. Computer Science"`
  - `"Law"` → `"LL.B."`
  - `"Medicine and Surgery"` → `"MBBS"`
  - `"Pharmacy"` → `"B.Pharm."`

- **`getDegreeForProgram(program)`** — A function that looks up a programme name in `PROGRAM_DEGREE_MAP`. It tries both exact match and case-insensitive match, returning the degree string or an empty string if not found. This is what powers the auto-fill feature on the degree field.

- **`PROGRAM_NAMES`** — The sorted array of all programme names from the map, used to populate the `<datalist>` autocomplete on the programme text input.

---

#### `src/data/nigerianUniversityPrograms.ts`
**What it is:** A comprehensive list of Nigerian university programmes.  
**What it contains:** `NIGERIAN_UNIVERSITY_PROGRAM_LIST` — an alphabetically sorted array of ~100 programme names (e.g. "Accounting", "Agricultural Engineering", "Computer Science", "Medicine and Surgery", "Zoology"). This populates the `<select>` dropdown on the IT Student programme question.

---

### 5.4 Frontend Components

---

#### `src/main.tsx`
**What it is:** The application entry point.  
**What it does:** This is the very first JavaScript file that runs. It:
1. Imports the global CSS reset (`index.css`)
2. Imports the `App` component
3. Finds the `<div id="root">` in `index.html`
4. Mounts the entire React application into that div
5. Wraps everything in `<StrictMode>` which enables additional development-time checks

---

#### `src/App.tsx`
**What it is:** The root React component.  
**What it does:** A minimal wrapper that imports `App.css` (the complete design system) and renders `<AssessmentForm />`. All application logic lives in `AssessmentForm` and below — `App.tsx` exists purely as the entry point React component.

---

#### `src/components/AssessmentForm.tsx`
**What it is:** The central state manager and navigation controller. The most important component.  
**What it does:** Owns all application state and coordinates every other component.

**State it manages:**
- `answers` — the `AnswerMap` containing every answer the user has given
- `currentIndex` — which question is currently being displayed (0-based position in `activeQuestions`)
- `safeIndex` — `currentIndex` clamped to valid bounds (prevents crashes if the question list changes)
- `slideDirection` — `'forward'` or `'back'` — determines which animation plays on question transition
- `showReview` — boolean flag: when true, show the Review page instead of a question
- `error` — the current validation error message (or null)
- `isSubmitting` — boolean: true while the API call is in progress
- `submissionResult` — the successful API response (contains the AI report text)
- `submissionError` — the error message if the API call failed

**localStorage persistence:**
On every state change, `answers`, `currentIndex`, and `showReview` are saved to `localStorage` under the key `career-assessment-v1`. When the component first loads, it reads from localStorage and restores the previous session. This means a page refresh does not lose progress.

**Key functions:**
- `handleAnswer(id, value)` — Updates the answer for a given question ID. Also handles side effects: auto-fills `q_degree` when `q_program_studied` changes, and clears group-specific answers when the user changes their group selection.
- `validateCurrent()` — Checks if the current question's answer is valid. Returns an error message string if invalid, or null if valid.
- `handleNext()` — Validates the current question; if valid, advances to the next question or shows the Review page.
- `handleBack()` — Goes back to the previous question, or from Review back to the last question.
- `handleSubmit()` — Sends the completed form data to `POST /api/assessments`, handles the response.
- `handleReset()` — Clears all state and localStorage, returning to Question 1.

**What it renders:**
- `<ProgressBar>` — always visible at the top
- `<QuestionPage>` — when not on the review page, renders the current question
- `<ReviewPage>` — when `showReview` is true

---

#### `src/components/QuestionPage.tsx`
**What it is:** The component that renders a single question.  
**What it does:** Receives a `Question` object and the current answer, and renders the appropriate input UI for that question's type. All 35 possible questions route through this single component.

**Props it receives:**
- `question` — the full Question object
- `value` — the current answer (string or string array)
- `allAnswers` — all answers so far (used for the degree auto-fill badge)
- `onChange` — function to call when the answer changes
- `error` — validation error message to display
- `questionNumber` / `totalQuestions` — for the "7 / 32" counter
- `onNext` / `onBack` — navigation callbacks
- `isFirst` — whether this is Question 1 (hides the Back button)
- `slideDirection` — controls the CSS animation class

**How it renders each type:**

| Question Type | What Renders |
|---|---|
| `text` | Standard `<input type="text">` |
| `text-autofill` | `<input>` + `<datalist>` for browser autocomplete |
| `date` | `<input type="date">` styled with dark theme |
| `textarea` | `<textarea>` with configurable rows |
| `single-select-dropdown` | `<select>` with `<optgroup>` support |
| `single-select-card` (single) | Clickable cards with amber indicator dot; auto-advances on pick |
| `single-select-card` (multi) | Same cards but with square checkbox indicator; allows multiple picks |
| `multi-select-pill` | Grid of pill buttons from `PillCheckbox` component |
| `categorized-multi-select` | Category headers + pill grids using career interest data |

**Auto-advance behaviour:**  
For standard single-select cards, clicking an option immediately triggers `onNext` after a 280ms delay (giving visual feedback before moving on). Multi-select cards do NOT auto-advance — they require the Continue button.

**Auto-fill badge:**  
If the current question is `q_degree` and the value matches what `getDegreeForProgram()` would return, an amber "✦ Auto-filled" badge appears below the input.

---

#### `src/components/ReviewPage.tsx`
**What it is:** The final review screen shown before submission.  
**What it does:**

1. If a `submissionResult` exists (AI report is ready), it renders `<AIResultPanel>` instead of the review
2. Otherwise, it shows a full summary of all answers:
   - Core questions listed with their question text as the label and the answer as the value
   - Array answers (career interests, skills) rendered as coloured pill tags (amber for interests, cyan for skills)
   - Group shown as a styled badge
   - Scenario responses in a collapsible section (hidden by default, toggle shows all answered scenarios with their chosen option)
3. A Submit button at the bottom
4. While submitting: a spinner animation and "Generating your career report…" message
5. If submission fails: a red error banner with the server's error message

---

#### `src/components/ui/AIResultPanel.tsx`
**What it is:** The component that displays the completed AI career report.  
**What it does:**
- Shows a green checkmark success header: "Your Career Report is Ready"
- Renders the AI report text (which is Markdown) using the `react-markdown` library, converting it to properly formatted HTML (headings, bold, bullet lists)
- The report panel uses a white/light background — intentionally contrasting with the dark theme to make the report feel like a printed document
- "Save as PDF" button — triggers `window.print()`. The CSS `@media print` rules ensure only the report content prints
- "Start a new assessment" button — calls `onReset` to clear all state and start fresh

---

#### `src/components/ui/ProgressBar.tsx`
**What it is:** The thin amber bar at the very top of the viewport.  
**What it does:** Receives `step` and `totalSteps` as props, calculates the percentage (`step / totalSteps * 100`), and sets the width of the amber fill bar to that percentage. The CSS transition makes the fill animate smoothly as the user advances. Also sets proper ARIA attributes for accessibility.

---

#### `src/components/ui/PillCheckbox.tsx`
**What it is:** A single toggleable pill/chip button.  
**What it does:** Renders a rounded button that visually switches between unselected (transparent, grey border) and selected (amber background, amber border, checkmark icon) states. Used for career interests, skills, and any multi-select question. Supports both mouse click and keyboard (Space/Enter) activation. Has proper `role="checkbox"` and `aria-checked` for accessibility.

---

#### `src/components/ui/FormField.tsx`
**What it is:** A wrapper component that adds structure to a form input.  
**What it does:** Wraps any input with a consistent layout: label on top, an optional badge next to the label (used for the auto-fill badge), an optional hint below the label, the input itself, and an error message at the bottom (with a warning icon). Error messages are linked to the input via `aria-describedby` for screen reader accessibility.

---

#### `src/components/ui/CategorizedPillGroup.tsx`
**What it is:** A grouped multi-select pill grid for career interests.  
**What it does:** Iterates through all 14 career categories from `CAREER_INTEREST_CATEGORIES`, renders a bold uppercase category header for each, then a flex-wrap grid of `PillCheckbox` components for every career in that category. Manages the toggle logic (adding/removing careers from the selected array).

---

### 5.5 Backend API

---

#### `api/assessments.ts`
**What it is:** The single backend serverless function, deployed by Vercel as `POST /api/assessments`.  
**What it does:** This file runs on Vercel's servers (not in the browser). It:
1. Receives the submitted form data
2. Validates it
3. Calls Claude AI to generate the report
4. Saves everything to the Neon database
5. Returns the AI report to the frontend

**Constants:**
- `MAX_PAYLOAD_BYTES = 65,536` — rejects submissions larger than 64KB to prevent abuse
- `REQUIRED_FIELDS` — the list of field names that must be present in every submission
- `VALID_GROUPS` — a Set containing `'IT_STUDENT'` and `'NYSC_CORP_MEMBER'`

**`ensureTable(sql)`**  
Creates the `assessments` table in the database if it does not already exist. Uses `CREATE TABLE IF NOT EXISTS`, so it is safe to run on every request. This means no manual database migration is ever needed — the first submission creates the table automatically.

**`generateAIReport(payload)`**  
Calls the Anthropic API using the `claude-sonnet-4-6` model. Constructs a detailed prompt that:
- Identifies the respondent's name and group
- Passes all their assessment data as JSON
- Instructs Claude to write a warm, personalised, mentor-like report
- Specifies exactly 6 sections the report must contain (see AI Integration section below)
- Sets guardrails (700–1000 words, Nigeria/Africa context, reference specific answers)
- Sets `max_tokens: 2000` to limit response length

**`validatePayload(payload)`**  
Checks that all required fields are present, that arrays are non-empty, and that the group value is valid. Returns an error message string if invalid, or null if valid.

**`handler(req, res)` — the main function**  
The entry point Vercel calls for every POST request:
1. Rejects non-POST methods with 405
2. Rejects oversized payloads with 413
3. Validates the payload (400 if invalid)
4. Runs `generateAIReport()` and `ensureTable()` **in parallel** (using `Promise.all`) to save time
5. Inserts the complete submission record into the database
6. Returns `201` with `{ id, submittedAt, aiReport }`
7. Returns `500` if anything throws, with a descriptive error message

---

### 5.6 Styles

---

#### `src/index.css`
**What it is:** A minimal CSS reset.  
**What it does:** Applies three rules globally:
- `box-sizing: border-box` — makes width/height calculations include padding and borders (prevents layout surprises)
- Resets all margins and paddings to 0
- Enables antialiased font rendering for sharper text on screens

---

#### `src/App.css`
**What it is:** The complete design system and all component styles.  
**Structure:** Organised into 24 numbered sections:

1. **CSS Custom Properties** — The entire colour palette, typography scale, spacing, shadows, and transition speeds defined as CSS variables. All components reference these variables, making global theme changes a one-line edit.

2. **Base Styles** — `body` background colour, font family, and the atmospheric gradient overlay (subtle amber and cyan radial gradients at opposite corners of the screen).

3. **Keyframe Animations** — Six animations:
   - `slideUpFade` — elements fade in while sliding up from 20px below
   - `slideInRight` — page slides in from the right (forward navigation)
   - `slideInLeft` — page slides in from the left (back navigation)
   - `fadeIn` — simple opacity fade
   - `scalePop` — element scales from 92% to 100% while fading in
   - `spin` — 360° rotation (used for the loading spinner)
   - `pulse` — opacity pulses between 100% and 40% (loading text)

4. **Layout** — The `.form-wrapper` (max 720px wide, centred) and `.step-card` (dark surface panel with rounded corners and shadow).

5. **Progress Bar** — Fixed at the very top of the viewport. 3px tall. Amber fill that transitions smoothly.

6. **Step Indicator** — Pill-row navigation (legacy component, kept in codebase).

7. **Form Base** — Global styles for `<input>`, `<select>`, `<textarea>` elements — dark elevated background, subtle border, amber glow on focus.

8–18. **Component Styles** — Individual styles for option cards, pill checkboxes, group selection cards, buttons (primary amber, secondary outlined), auto-fill badges, scenario question cards, review sections, submit states, error banners, and the AI result panel.

19–21. **Single-Question-Per-Page Layout** — The `question-card`, question counter, question heading, option card grid, checkbox variant indicators, selection counter, and question navigation row.

22. **Print Styles** — `@media print` hides everything except the AI report content and resets it to a clean white background for PDF saving.

23. **Responsive Breakpoints** — `@media (max-width: 640px)` collapses two-column grids to single column, reduces font sizes, and stacks navigation buttons vertically on small screens.

24. **Reduced Motion** — `@media (prefers-reduced-motion: reduce)` disables all slide animations for users who have enabled the OS accessibility setting to reduce motion.

---

## 6. Data Flow — From Form to AI Report

This section traces exactly what happens when a user completes the form and clicks Submit.

```
USER BROWSER                          VERCEL SERVER                    EXTERNAL SERVICES
─────────────────                     ─────────────────                ─────────────────

1. User fills out all questions
   Answers stored in AnswerMap
   (in React state + localStorage)

2. User clicks "Submit & Get Report"

3. AssessmentForm calls buildPayload()
   AnswerMap → AIAnalysisPayload
   (flat object with all fields)

4. fetch('POST /api/assessments',      
   body: JSON.stringify(payload))  ──────────────────────────────→

                                   5. api/assessments.ts receives request
                                   
                                   6. validatePayload() checks all
                                      required fields are present
                                   
                                   7. Runs in parallel:
                                      a) ensureTable() ─────────────────────────→ Neon DB
                                         creates table if not exists  ←─────────────────────
                                      
                                      b) generateAIReport() ────────────────────→ Anthropic API
                                         sends prompt + data             ←──────── AI generates
                                         receives markdown report                  career report

                                   8. INSERT INTO assessments
                                      (all fields + ai_report) ────────────────→ Neon DB
                                                                ←────────────────

                                   9. res.status(201).json({
                                      id, submittedAt, aiReport
                                      })

10. ←─────────────────────────────────

11. setSubmissionResult(response)
    clearProgress() (localStorage)

12. ReviewPage renders AIResultPanel
    react-markdown renders the
    AI report as formatted HTML

13. User sees their career report
```

---

## 7. Database Schema

The application uses a single table: `assessments`.

```sql
CREATE TABLE IF NOT EXISTS assessments (
  id                       TEXT        PRIMARY KEY,
  submitted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  respondent_name          TEXT        NOT NULL,
  respondent_group         TEXT        NOT NULL,         -- 'IT_STUDENT' or 'NYSC_CORP_MEMBER'
  organization_department  TEXT        NOT NULL,
  school_program           TEXT,                         -- NULL for NYSC members
  expected_completion_date TEXT,                         -- NULL for NYSC members
  program_studied          TEXT,                         -- NULL for IT Students
  degree_required          TEXT,                         -- NULL for IT Students
  service_end_date         TEXT,                         -- NULL for IT Students
  career_interests         JSONB       NOT NULL DEFAULT '[]',   -- array of strings
  enjoyed_skills           JSONB       NOT NULL DEFAULT '[]',   -- array of strings
  work_environment         TEXT        NOT NULL,
  primary_motivation       TEXT        NOT NULL,
  biggest_strength         TEXT        NOT NULL,
  short_term_goal          TEXT        NOT NULL,
  long_term_goal           TEXT        NOT NULL,
  scenario_responses       JSONB       NOT NULL DEFAULT '{}',   -- object: { question_id: "answer" }
  ai_report                TEXT                          -- the full Markdown report text
);
```

**Notes:**
- `id` is a UUID (universally unique identifier) generated server-side using Node's `crypto.randomUUID()`
- `submitted_at` is automatically set to the current timestamp by the database
- `JSONB` columns store JSON data — arrays and objects — efficiently in PostgreSQL
- The group-specific fields (`school_program` etc.) are nullable because they only apply to one group
- The table is created automatically on the first submission — no manual setup needed

---

## 8. AI Integration

**Model used:** `claude-sonnet-4-6` (Anthropic Claude Sonnet 4.6)  
**Location:** Entirely server-side in `api/assessments.ts` — the API key is never exposed to the browser

### The Prompt Structure

The AI is given a detailed system prompt explaining:
- Its role: expert career guidance counsellor with knowledge of the Nigerian/African job market
- The respondent's group (IT Student or NYSC Corp Member) and name
- The complete assessment data as formatted JSON
- Exact instructions for the 6 required report sections

### The 6 Report Sections

| Section | Content |
|---|---|
| **Career Personality Profile** | 2–3 paragraphs describing the respondent's professional personality, working style, and values, inferred from their scenario responses and stated preferences |
| **Top Career Matches** | 3–5 career paths that best match their profile, with a 2–3 sentence explanation for each that references their specific answers |
| **Immediate Action Plan (Next 90 Days)** | 5–7 concrete, specific actions they can take right now — Nigeria/Africa-aware (specific platforms, certifications, communities) |
| **Skills to Develop** | 3–5 high-leverage skills for their trajectory, with why each matters and one specific way to start learning it |
| **Long-Term Vision Alignment** | 1–2 paragraphs connecting their long-term goal to their current profile — affirming what's aligned and gently flagging any gaps |
| **A Word from Your Career Mentor** | A closing personal paragraph addressing the respondent by first name — warm, specific, motivating — ending with a reflective question |

### Quality Guardrails Instructed

- Be specific to the individual's actual data — no generic advice
- Reference scenario responses by name where relevant
- Keep the total report between 700–1000 words
- Write for a Nigerian/African professional context

---

## 9. Environment Variables

Two environment variables must be configured — in Vercel's dashboard under Settings → Environment Variables:

| Variable | Description | Where to get it |
|---|---|---|
| `DATABASE_URL` | Direct connection string to the Neon PostgreSQL database | Neon Console → Project → Connection Details → select "Direct" (not Pooled) |
| `ANTHROPIC_API_KEY` | API key for accessing Claude | console.anthropic.com → API Keys |

**Important:** Use the **direct** Neon connection string (not the pooler URL). The `@neondatabase/serverless` library requires a direct connection. The pooler URL contains `-pooler.` in the hostname — the direct URL does not.

---

## 10. Deployment

The application is deployed on **Vercel** with zero configuration beyond the environment variables.

### Deployment Process

1. Code is pushed to the `main` branch on GitHub
2. Vercel automatically detects the push and starts a new build
3. Vercel runs `npm install` (using `package-lock.json` for exact versions)
4. Vercel runs `tsc -b && vite build` to compile TypeScript and bundle the frontend
5. Vercel deploys the `dist/` folder as the static frontend
6. Vercel deploys `api/assessments.ts` as a serverless Node.js function at `/api/assessments`
7. The `vercel.json` routing rule ensures any `/api/*` request goes to the serverless function

### Build Time vs. Runtime

- **Build time:** TypeScript compilation, Vite bundling, asset optimisation
- **Runtime (browser):** React, all UI components, localStorage, fetch calls
- **Runtime (server, per request):** Database connection, AI API call, SQL insert

---

## 11. Key Design Decisions

### Why one question per page?
Showing one question at a time reduces cognitive load. Respondents focus on a single question without being overwhelmed by a long form. The progress bar provides a sense of momentum and completion.

### Why a seeded shuffle?
Shuffling the psychographic questions prevents respondents from seeing a predictable pattern that might bias their answers. Using a fixed seed means all users see the same order — this is important for data consistency if the organisation ever wants to analyse response patterns across users.

### Why localStorage for persistence?
The form has 30+ questions. A page refresh should not force the user to start over. localStorage is built into every browser, requires no server infrastructure, and is cleared automatically on successful submission or reset.

### Why Neon + @neondatabase/serverless?
Vercel serverless functions are stateless and short-lived — they cannot maintain persistent database connections. `@neondatabase/serverless` is purpose-built for this: it uses HTTP-based queries instead of persistent TCP connections, making it compatible with serverless environments.

### Why no external state library (Redux, Zustand)?
The application state is simple and local — one component owns it all. External state libraries add complexity and bundle size without benefit here. React's built-in `useState` and `useMemo` are sufficient.

### Why no CSS framework (Tailwind, etc.)?
Plain CSS with custom properties gives full control over the design, produces smaller bundles, and is easier to understand for someone reading the code. The "Deep Futures" dark theme required precise, non-generic styling that a utility framework would have complicated.

---

*End of document.*
