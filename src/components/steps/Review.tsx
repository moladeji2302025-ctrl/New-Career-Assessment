import { useState } from 'react';
import type { AssessmentFormData, SubmissionResult } from '../../types/assessment';
import { SCENARIO_QUESTIONS } from '../../data/scenarioQuestions';
import AIResultPanel from '../ui/AIResultPanel';

interface ReviewProps {
  formData: AssessmentFormData;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
  submissionError: string | null;
  onSubmit: () => void;
  onBack: () => void;
  onReset: () => void;
}

export default function Review({
  formData,
  isSubmitting,
  submissionResult,
  submissionError,
  onSubmit,
  onBack,
  onReset,
}: ReviewProps) {
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const ias = formData.interestsAndSkills;
  const isNYSC = formData.group === 'NYSC_CORP_MEMBER';
  const answeredScenarios = SCENARIO_QUESTIONS.filter(q => ias.scenarioResponses[q.id]);

  if (submissionResult) {
    return <AIResultPanel result={submissionResult} onReset={onReset} />;
  }

  return (
    <div>
      <h2 className="step-title">Review Your Answers</h2>
      <p className="step-subtitle">
        Check everything looks right before we generate your career report.
      </p>
      <div className="step-divider" aria-hidden="true" />

      {/* Identity */}
      <div className="review-section">
        <div className="review-section-title">Identity</div>
        <div className="review-row">
          <span className="review-row__label">Name</span>
          <span className="review-row__value">{formData.respondentName}</span>
        </div>
        <div className="review-row">
          <span className="review-row__label">Group</span>
          <span className="review-row__value">
            <span className="review-tag review-tag--group">
              {isNYSC ? 'NYSC Corp Member' : 'IT Student'}
            </span>
          </span>
        </div>
        <div className="review-row">
          <span className="review-row__label">Department</span>
          <span className="review-row__value">{formData.common.organizationDepartment}</span>
        </div>
      </div>

      {/* Background */}
      <div className="review-section">
        <div className="review-section-title">Background</div>
        {!isNYSC ? (
          <>
            <div className="review-row">
              <span className="review-row__label">Programme</span>
              <span className="review-row__value">{formData.itStudent.schoolProgram}</span>
            </div>
            <div className="review-row">
              <span className="review-row__label">Expected completion</span>
              <span className="review-row__value">{formData.itStudent.expectedCompletionDate}</span>
            </div>
          </>
        ) : (
          <>
            <div className="review-row">
              <span className="review-row__label">Programme studied</span>
              <span className="review-row__value">{formData.nyscCorpMember.programStudied}</span>
            </div>
            <div className="review-row">
              <span className="review-row__label">Degree</span>
              <span className="review-row__value">{formData.nyscCorpMember.degreeRequired}</span>
            </div>
            <div className="review-row">
              <span className="review-row__label">Service end date</span>
              <span className="review-row__value">{formData.nyscCorpMember.serviceEndDate}</span>
            </div>
          </>
        )}
      </div>

      {/* Interests */}
      <div className="review-section">
        <div className="review-section-title">Interests</div>
        <div className="review-row">
          <span className="review-row__label">Career interests</span>
          <div className="review-tags">
            {ias.careerInterests.map(i => (
              <span key={i} className="review-tag review-tag--amber">{i}</span>
            ))}
          </div>
        </div>
        <div className="review-row" style={{ marginTop: 8 }}>
          <span className="review-row__label">Skills enjoyed</span>
          <div className="review-tags">
            {ias.enjoyedSkills.map(s => (
              <span key={s} className="review-tag review-tag--cyan">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Working Style */}
      <div className="review-section">
        <div className="review-section-title">Working Style</div>
        <div className="review-row">
          <span className="review-row__label">Work environment</span>
          <span className="review-row__value">{ias.workEnvironment}</span>
        </div>
        <div className="review-row">
          <span className="review-row__label">Motivation</span>
          <span className="review-row__value">{ias.primaryMotivation}</span>
        </div>
        <div className="review-row">
          <span className="review-row__label">Biggest strength</span>
          <span className="review-row__value">{ias.biggestStrength}</span>
        </div>
      </div>

      {/* Goals */}
      <div className="review-section">
        <div className="review-section-title">Goals</div>
        <div className="review-row" style={{ flexDirection: 'column', gap: 6 }}>
          <span className="review-row__label">Short-term (1–2 years)</span>
          <div className="review-goal">{ias.shortTermGoal}</div>
        </div>
        <div className="review-row" style={{ flexDirection: 'column', gap: 6, marginTop: 12 }}>
          <span className="review-row__label">Long-term (5+ years)</span>
          <div className="review-goal">{ias.longTermGoal}</div>
        </div>
      </div>

      {/* Scenario answers (collapsible) */}
      {answeredScenarios.length > 0 && (
        <div className="review-section">
          <div className="review-section-title">Scenario Responses</div>
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setScenariosOpen(o => !o)}
            aria-expanded={scenariosOpen}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: scenariosOpen ? 'rotate(90deg)' : 'none', transition: '150ms' }}
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            View scenario answers ({answeredScenarios.length} answered)
          </button>
          {scenariosOpen && (
            <div className="collapse-content">
              {answeredScenarios.map(q => {
                const chosen = q.options.find(o => o.value === ias.scenarioResponses[q.id]);
                return (
                  <div key={q.id} className="scenario-review-item">
                    <div className="scenario-review-item__q">{q.question}</div>
                    <div className="scenario-review-item__a">→ {chosen?.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="submit-footer">
        {isSubmitting ? (
          <div className="submit-loading">
            <div className="spinner" aria-hidden="true" />
            <div className="submit-loading-text">Generating your career report…</div>
          </div>
        ) : (
          <>
            <div className="nav-row">
              <button type="button" className="btn-secondary" onClick={onBack} disabled={isSubmitting}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>
              <button type="button" className="btn-primary" onClick={onSubmit} disabled={isSubmitting}>
                Submit &amp; Get Your Career Report →
              </button>
            </div>
            <p className="submit-hint">
              Your responses are saved privately. Your personalised report will be generated in about 10–15 seconds.
            </p>
          </>
        )}

        {submissionError && (
          <div className="error-banner" role="alert">
            <span className="error-banner__icon" aria-hidden="true">⚠</span>
            <div className="error-banner__text">{submissionError}</div>
          </div>
        )}
      </div>
    </div>
  );
}
