import FormField from '../ui/FormField';
import OptionCard from '../ui/OptionCard';
import PillCheckbox from '../ui/PillCheckbox';
import CategorizedPillGroup from '../ui/CategorizedPillGroup';
import type { AssessmentFormData, ValidationErrors } from '../../types/assessment';
import { SCENARIO_QUESTIONS } from '../../data/scenarioQuestions';
import {
  ENJOYED_SKILLS_OPTIONS,
  WORK_ENVIRONMENT_OPTIONS,
  PRIMARY_MOTIVATION_OPTIONS,
  BIGGEST_STRENGTH_OPTIONS,
} from '../../data/organizationDepartments';

interface SubtleQuestionsProps {
  formData: AssessmentFormData;
  errors: ValidationErrors;
  onChange: (patch: Partial<AssessmentFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SubtleQuestions({ formData, errors, onChange, onNext, onBack }: SubtleQuestionsProps) {
  const ias = formData.interestsAndSkills;

  const setIAS = (patch: Partial<typeof ias>) =>
    onChange({ interestsAndSkills: { ...ias, ...patch } });

  const toggleSkill = (skill: string) => {
    const s = ias.enjoyedSkills;
    setIAS({ enjoyedSkills: s.includes(skill) ? s.filter(x => x !== skill) : [...s, skill] });
  };

  const setScenario = (id: string, value: string) =>
    setIAS({ scenarioResponses: { ...ias.scenarioResponses, [id]: value } });

  const answeredCount = Object.keys(ias.scenarioResponses).length;

  return (
    <div>
      <h2 className="step-title">Interests & Working Style</h2>
      <p className="step-subtitle">Help us understand what energises and motivates you.</p>
      <div className="step-divider" aria-hidden="true" />

      {/* Sub-section 1 — Scenario Questions */}
      <div className="subsection">
        <div className="scenario-section-header">
          <div className="subsection-title">20 Scenario Questions</div>
          <div className="subsection-subtitle">
            Read each scenario. Pick the response that comes most naturally — there are no right answers.
            <br />
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Optional — but they enrich your report.</span>
          </div>
        </div>

        {SCENARIO_QUESTIONS.map((q, idx) => {
          const answered = !!ias.scenarioResponses[q.id];
          return (
            <div
              key={q.id}
              className={`scenario-card${answered ? ' scenario-card--answered' : ''}`}
            >
              <div className="scenario-card__header">
                <span className="scenario-card__number">Q{String(idx + 1).padStart(2, '0')}</span>
                <span className="scenario-card__question">{q.question}</span>
                {answered && <span className="scenario-card__answered-badge" aria-hidden="true">✓</span>}
              </div>
              <div
                className="scenario-card__options"
                role="radiogroup"
                aria-label={q.question}
              >
                {q.options.map(opt => (
                  <OptionCard
                    key={opt.value}
                    name={q.id}
                    value={opt.value}
                    label={opt.label}
                    selected={ias.scenarioResponses[q.id] === opt.value}
                    onChange={v => setScenario(q.id, v)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>
          {answeredCount} of {SCENARIO_QUESTIONS.length} answered
        </p>
      </div>

      <div className="section-divider" />

      {/* Sub-section 2 — Career Interests */}
      <div className="subsection">
        <div className="subsection-title">Career Interests</div>
        <div className="subsection-subtitle">Select all areas that genuinely excite you.</div>
        {errors.careerInterests && (
          <p className="form-error" role="alert" style={{ marginBottom: 12 }}>
            <span aria-hidden="true">⚠</span> {errors.careerInterests}
          </p>
        )}
        <CategorizedPillGroup
          selected={ias.careerInterests}
          onChange={v => setIAS({ careerInterests: v })}
        />
      </div>

      <div className="section-divider" />

      {/* Sub-section 3 — Skills */}
      <div className="subsection">
        <div className="subsection-title">Skills You Enjoy</div>
        <div className="subsection-subtitle">
          Think about what comes naturally and energises you — not just what you are good at.
        </div>
        {errors.enjoyedSkills && (
          <p className="form-error" role="alert" style={{ marginBottom: 12 }}>
            <span aria-hidden="true">⚠</span> {errors.enjoyedSkills}
          </p>
        )}
        <div className="pill-grid">
          {ENJOYED_SKILLS_OPTIONS.map(skill => (
            <PillCheckbox
              key={skill}
              label={skill}
              selected={ias.enjoyedSkills.includes(skill)}
              onToggle={() => toggleSkill(skill)}
            />
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* Sub-section 4 — Working Style */}
      <div className="subsection">
        <div className="subsection-title">Working Style</div>

        <div className="form-stack">
          {/* Work environment */}
          <FormField label="Preferred work environment" error={errors.workEnvironment}>
            <div
              role="radiogroup"
              aria-label="Preferred work environment"
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {WORK_ENVIRONMENT_OPTIONS.map(opt => (
                <OptionCard
                  key={opt}
                  name="workEnvironment"
                  value={opt}
                  label={opt}
                  selected={ias.workEnvironment === opt}
                  onChange={v => setIAS({ workEnvironment: v })}
                />
              ))}
            </div>
          </FormField>

          {/* Primary motivation */}
          <FormField label="What motivates you most?" htmlFor="motivation" error={errors.primaryMotivation}>
            <select
              id="motivation"
              value={ias.primaryMotivation}
              onChange={e => setIAS({ primaryMotivation: e.target.value })}
            >
              <option value="">Select your primary motivation</option>
              {PRIMARY_MOTIVATION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </FormField>

          {/* Biggest strength */}
          <FormField label="Your biggest strength" htmlFor="strength" error={errors.biggestStrength}>
            <select
              id="strength"
              value={ias.biggestStrength}
              onChange={e => setIAS({ biggestStrength: e.target.value })}
            >
              <option value="">Select your biggest strength</option>
              {BIGGEST_STRENGTH_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </FormField>

          {/* Short-term goal */}
          <FormField
            label="Short-term goal (1–2 years)"
            htmlFor="shortGoal"
            error={errors.shortTermGoal}
          >
            <textarea
              id="shortGoal"
              rows={3}
              placeholder="E.g. Land a junior software engineer role and build my first production project."
              value={ias.shortTermGoal}
              onChange={e => setIAS({ shortTermGoal: e.target.value })}
            />
          </FormField>

          {/* Long-term goal */}
          <FormField
            label="Long-term goal (5+ years)"
            htmlFor="longGoal"
            error={errors.longTermGoal}
          >
            <textarea
              id="longGoal"
              rows={3}
              placeholder="E.g. Lead a product team at an African tech company or start my own venture."
              value={ias.longTermGoal}
              onChange={e => setIAS({ longTermGoal: e.target.value })}
            />
          </FormField>
        </div>
      </div>

      <div className="nav-row">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Review Answers
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
