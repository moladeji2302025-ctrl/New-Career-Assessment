import { useState } from 'react';
import type { AnswerMap, AnswerValue } from '../types/question';
import type { Question } from '../types/question';
import type { SubmissionResult } from '../types/assessment';
import AIResultPanel from './ui/AIResultPanel';
import { SCENARIO_QUESTIONS } from '../data/scenarioQuestions';

interface ReviewPageProps {
  activeQuestions: Question[];
  answers: AnswerMap;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
  submissionError: string | null;
  onSubmit: () => void;
  onBack: () => void;
  onReset: () => void;
}

function formatValue(value: AnswerValue | undefined, questionId: string): React.ReactNode {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Not answered</span>;
  }
  if (Array.isArray(value)) {
    const colorClass = questionId === 'q_career_interests' ? 'review-tag--amber' : 'review-tag--cyan';
    return (
      <div className="review-tags">
        {value.map(v => <span key={v} className={`review-tag ${colorClass}`}>{v}</span>)}
      </div>
    );
  }
  if (questionId === 'q_group') {
    const label = value === 'IT_STUDENT' ? 'IT Student' : 'NYSC Corp Member';
    return <span className="review-tag review-tag--group">{label}</span>;
  }
  return <span className="review-row__value">{value}</span>;
}

const SCENARIO_IDS = new Set(SCENARIO_QUESTIONS.map(q => q.id));

export default function ReviewPage({
  activeQuestions,
  answers,
  isSubmitting,
  submissionResult,
  submissionError,
  onSubmit,
  onBack,
  onReset,
}: ReviewPageProps) {
  const [scenariosOpen, setScenariosOpen] = useState(false);

  if (submissionResult) {
    return <AIResultPanel result={submissionResult} onReset={onReset} />;
  }

  const scenarioQs = activeQuestions.filter(q => SCENARIO_IDS.has(q.id) && answers[q.id]);
  const coreQs = activeQuestions.filter(q => !SCENARIO_IDS.has(q.id));

  return (
    <div>
      <h2 className="step-title">Review your answers</h2>
      <p className="step-subtitle">
        Check everything below, then submit to generate your personalised career report.
      </p>
      <div className="step-divider" aria-hidden="true" />

      <div className="review-list">
        {coreQs.map(q => {
          const val = answers[q.id];
          if (!val && !q.required) return null;
          return (
            <div key={q.id} className="review-item">
              <span className="review-item__label">{q.question}</span>
              <div className="review-item__value">{formatValue(val, q.id)}</div>
            </div>
          );
        })}
      </div>

      {scenarioQs.length > 0 && (
        <div className="review-section" style={{ marginTop: 24 }}>
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setScenariosOpen(o => !o)}
            aria-expanded={scenariosOpen}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: scenariosOpen ? 'rotate(90deg)' : 'none', transition: '150ms' }}
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Scenario responses ({scenarioQs.length} answered)
          </button>
          {scenariosOpen && (
            <div className="collapse-content">
              {scenarioQs.map(q => {
                const chosen = q.options?.find(o => o.value === answers[q.id]);
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

      <div className="submit-footer" style={{ marginTop: 32 }}>
        {isSubmitting ? (
          <div className="submit-loading">
            <div className="spinner" aria-hidden="true" />
            <div className="submit-loading-text">Generating your career report…</div>
          </div>
        ) : (
          <>
            <div className="nav-row">
              <button type="button" className="btn-secondary" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>
              <button type="button" className="btn-primary" onClick={onSubmit}>
                Submit &amp; Get Your Report →
              </button>
            </div>
            <p className="submit-hint">
              Saved privately. Your personalised report generates in about 10–15 seconds.
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
