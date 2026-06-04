export interface ScenarioOption {
  value: string;
  label: string;
}

export interface ScenarioQuestion {
  id: string;
  question: string;
  options: ScenarioOption[];
}

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: 'sq_problem_solving',
    question: 'A complex problem lands on your desk with no clear solution. What do you do first?',
    options: [
      { value: 'a', label: 'Break it into smaller parts and tackle each one systematically' },
      { value: 'b', label: 'Research how others have solved similar problems before' },
      { value: 'c', label: 'Gather the right people in a room and brainstorm together' },
      { value: 'd', label: 'Trust your instinct and start experimenting immediately' },
      { value: 'e', label: 'Step back, sit with it, and let an approach emerge naturally' },
    ],
  },
  {
    id: 'sq_team_role',
    question: 'You are placed on a project team with no defined roles. Where do you naturally end up?',
    options: [
      { value: 'a', label: 'Taking charge — setting the agenda and assigning tasks' },
      { value: 'b', label: 'The strategist — thinking through the big picture and risks' },
      { value: 'c', label: 'The executor — heads down, getting things done' },
      { value: 'd', label: 'The connector — making sure everyone communicates well' },
      { value: 'e', label: 'The creative — generating ideas and thinking outside the box' },
    ],
  },
  {
    id: 'sq_free_saturday',
    question: 'You have a completely free Saturday with no obligations. How do you most naturally spend it?',
    options: [
      { value: 'a', label: 'Working on a personal project or learning something new' },
      { value: 'b', label: 'Exploring nature, the city, or somewhere unfamiliar' },
      { value: 'c', label: 'Hanging out with friends or attending a social event' },
      { value: 'd', label: 'Resting, reading, or reflecting quietly at home' },
      { value: 'e', label: 'Doing something creative — writing, art, music, cooking' },
    ],
  },
  {
    id: 'sq_ideal_workday',
    question: 'Describe your ideal workday.',
    options: [
      { value: 'a', label: 'Focused deep work sessions, minimal meetings, clear deliverables' },
      { value: 'b', label: 'Dynamic — different tasks, people, and problems every few hours' },
      { value: 'c', label: 'Collaborative — lots of discussion, ideation, and team interaction' },
      { value: 'd', label: 'Strategic — meetings with key stakeholders, planning and decisions' },
      { value: 'e', label: 'Independent — I set my own pace and own my whole workflow' },
    ],
  },
  {
    id: 'sq_pride_moment',
    question: 'Think of a moment you felt genuinely proud at work or in school. What made it special?',
    options: [
      { value: 'a', label: 'I solved something no one else could figure out' },
      { value: 'b', label: 'I created something original that people loved' },
      { value: 'c', label: 'I helped someone else succeed or grow' },
      { value: 'd', label: 'I led a team to a successful outcome' },
      { value: 'e', label: 'I was recognised publicly for my contribution' },
    ],
  },
  {
    id: 'sq_social_impact',
    question: 'If you could spend a year solving one problem in Nigeria, what would it be?',
    options: [
      { value: 'a', label: 'Poor access to quality education' },
      { value: 'b', label: 'Youth unemployment and lack of skills' },
      { value: 'c', label: 'Inadequate healthcare infrastructure' },
      { value: 'd', label: 'Insecurity and governance failures' },
      { value: 'e', label: 'Lack of reliable electricity and infrastructure' },
    ],
  },
  {
    id: 'sq_complexity',
    question: 'Someone hands you a highly technical report with dense data and jargon. You:',
    options: [
      { value: 'a', label: 'Dig in — you love breaking down complex material' },
      { value: 'b', label: 'Skim for the key takeaways and ask someone to explain the rest' },
      { value: 'c', label: 'Find a visual or summary version before tackling the full document' },
      { value: 'd', label: 'Delegate the analysis and focus on the implications' },
      { value: 'e', label: 'Work through it with a colleague side by side' },
    ],
  },
  {
    id: 'sq_feedback',
    question: 'You receive critical feedback on a project you worked hard on. Your reaction?',
    options: [
      { value: 'a', label: 'I immediately want to understand exactly what went wrong and fix it' },
      { value: 'b', label: 'I feel it briefly, then separate emotion from the useful information' },
      { value: 'c', label: 'I seek out a second opinion before acting on the feedback' },
      { value: 'd', label: 'I sit with it overnight — I process better after stepping away' },
      { value: 'e', label: 'I welcome it — feedback is the fastest way to get better' },
    ],
  },
  {
    id: 'sq_communication',
    question: 'You need to explain a complicated idea to someone unfamiliar with the topic. You:',
    options: [
      { value: 'a', label: 'Use an analogy or story they can relate to' },
      { value: 'b', label: 'Draw it out — diagrams or visuals work best' },
      { value: 'c', label: 'Walk through it step by step, logically' },
      { value: 'd', label: 'Ask questions first to understand their existing knowledge' },
      { value: 'e', label: 'Give them the big picture first, then drill into detail' },
    ],
  },
  {
    id: 'sq_risk_tolerance',
    question: 'You are offered a high-paying job at a stable company vs. a co-founder role at an exciting early-stage startup. You choose:',
    options: [
      { value: 'a', label: 'The stable job — I value security and a clear career path' },
      { value: 'b', label: 'The startup — the potential upside and challenge excite me' },
      { value: 'c', label: 'The startup but only if I believe deeply in the product' },
      { value: 'd', label: 'I would negotiate — maybe I can do both or get equity from the stable job' },
      { value: 'e', label: 'Neither — I want to build my own thing entirely' },
    ],
  },
  {
    id: 'sq_learning_style',
    question: 'You want to master a new skill as quickly as possible. How do you learn best?',
    options: [
      { value: 'a', label: 'Building a real project from day one — learn by doing' },
      { value: 'b', label: 'Structured courses with clear milestones and progress tracking' },
      { value: 'c', label: 'Finding a mentor or community who already has the skill' },
      { value: 'd', label: 'Reading extensively — books, papers, and documentation' },
      { value: 'e', label: 'Watching video tutorials and following along' },
    ],
  },
  {
    id: 'sq_long_term_identity',
    question: 'In 10 years, how do you want to be known professionally?',
    options: [
      { value: 'a', label: 'The expert — the go-to person in a specific discipline' },
      { value: 'b', label: 'The leader — someone who builds and runs successful teams or organisations' },
      { value: 'c', label: 'The innovator — known for creating something new and impactful' },
      { value: 'd', label: 'The connector — the person who brings the right people together' },
      { value: 'e', label: 'The changemaker — known for social or systemic impact at scale' },
    ],
  },
  {
    id: 'sq_tools_enjoy',
    question: 'Which type of tool do you find yourself most drawn to and comfortable using?',
    options: [
      { value: 'a', label: 'Code editors, terminals, and developer tools' },
      { value: 'b', label: 'Design and visual tools (Figma, Canva, Photoshop)' },
      { value: 'c', label: 'Spreadsheets, data tools (Excel, Power BI, Python)' },
      { value: 'd', label: 'Collaboration platforms (Notion, Slack, project management tools)' },
      { value: 'e', label: 'Presentation and communication tools (PowerPoint, video, docs)' },
    ],
  },
  {
    id: 'sq_decision_making',
    question: 'When you have to make a big decision under uncertainty, you:',
    options: [
      { value: 'a', label: 'Gather as much data as possible before deciding' },
      { value: 'b', label: 'Trust your gut — intuition is usually right for you' },
      { value: 'c', label: 'Talk it through with trusted people in your network' },
      { value: 'd', label: 'List pros and cons methodically and score them' },
      { value: 'e', label: 'Ask yourself: "What would I regret not doing?" and go from there' },
    ],
  },
  {
    id: 'sq_energy_drain',
    question: 'Which of these work situations drains your energy the most?',
    options: [
      { value: 'a', label: 'Back-to-back meetings with no time to think' },
      { value: 'b', label: 'Repetitive tasks with no novelty or challenge' },
      { value: 'c', label: 'Working alone for long stretches without human contact' },
      { value: 'd', label: 'Ambiguity — when goals and expectations are unclear' },
      { value: 'e', label: 'Bureaucracy — slow processes and approval chains' },
    ],
  },
  {
    id: 'sq_side_project',
    question: 'If you started a side project this weekend, what would it most likely be?',
    options: [
      { value: 'a', label: 'A software app or digital tool solving a real problem' },
      { value: 'b', label: 'A content channel — blog, podcast, YouTube, or newsletter' },
      { value: 'c', label: 'A small business or service offering' },
      { value: 'd', label: 'A community, movement, or social initiative' },
      { value: 'e', label: 'A creative work — writing, art, music, or design' },
    ],
  },
  {
    id: 'sq_achievement_type',
    question: 'Which achievement would make you feel most accomplished?',
    options: [
      { value: 'a', label: 'Publishing a major research paper or becoming a certified expert' },
      { value: 'b', label: 'Building a company that employs and impacts hundreds of people' },
      { value: 'c', label: 'Creating a product or piece of work that is widely used or loved' },
      { value: 'd', label: 'Being appointed to a leadership role — team lead, director, or executive' },
      { value: 'e', label: 'Running a programme that visibly changes lives in your community' },
    ],
  },
  {
    id: 'sq_conflict_resolution',
    question: 'Two colleagues on your team disagree strongly and it is slowing everything down. You:',
    options: [
      { value: 'a', label: 'Step in and mediate — you bring both sides together and find common ground' },
      { value: 'b', label: 'Escalate to the manager — conflict resolution is their responsibility' },
      { value: 'c', label: 'Talk to each person privately to understand their perspective first' },
      { value: 'd', label: 'Let them work it out — you do not get involved in interpersonal issues' },
      { value: 'e', label: 'Suggest a structured process — a proper meeting with a clear agenda' },
    ],
  },
  {
    id: 'sq_new_skill',
    question: 'Your organisation wants to invest in your development. You ask for training in:',
    options: [
      { value: 'a', label: 'A hard technical skill directly linked to your current work' },
      { value: 'b', label: 'Leadership, management, or executive presence' },
      { value: 'c', label: 'A creative or design skill you have always been curious about' },
      { value: 'd', label: 'A business skill — finance, strategy, or entrepreneurship' },
      { value: 'e', label: 'Communication — writing, public speaking, or storytelling' },
    ],
  },
  {
    id: 'sq_work_rhythm',
    question: 'Which best describes your natural work rhythm?',
    options: [
      { value: 'a', label: 'Long focused sprints — I go deep on one thing for hours' },
      { value: 'b', label: 'Short bursts — I switch tasks often and stay energised by variety' },
      { value: 'c', label: 'Structured routine — same time, same process, day to day' },
      { value: 'd', label: 'Deadline-driven — I do my best work with urgency and pressure' },
      { value: 'e', label: 'Flexible — I work when inspiration hits, not on a fixed schedule' },
    ],
  },
];
