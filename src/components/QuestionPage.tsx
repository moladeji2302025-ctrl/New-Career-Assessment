import { useRef, useEffect } from 'react';
import type { Question, AnswerMap, AnswerValue } from '../types/question';
import { CAREER_INTEREST_CATEGORIES } from '../data/organizationDepartments';
import { getDegreeForProgram } from '../data/programDegreeMapping';
import PillCheckbox from './ui/PillCheckbox';

interface QuestionPageProps {
  question: Question;
  value: AnswerValue | undefined;
  allAnswers: AnswerMap;
  onChange: (id: string, value: AnswerValue) => void;
  error: string | null;
  questionNumber: number;
  totalQuestions: number;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  slideDirection: 'forward' | 'back';
}

export default function QuestionPage({
  question,
  value,
  allAnswers,
  onChange,
  error,
  questionNumber,
  totalQuestions,
  onNext,
  onBack,
  isFirst,
  slideDirection,
}: QuestionPageProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (el && (question.type === 'text' || question.type === 'text-autofill' || question.type === 'textarea')) {
      el.focus();
    }
  }, [question.id, question.type]);

  const strVal = (value as string) ?? '';
  const arrVal = (value as string[]) ?? [];

  const handleCardSelect = (v: string) => {
    onChange(question.id, v);
    setTimeout(onNext, 280);
  };

  const togglePill = (item: string) => {
    const current = arrVal;
    const next = current.includes(item)
      ? current.filter(x => x !== item)
      : [...current, item];
    onChange(question.id, next);
  };

  const cardClass = `question-card question-card--${slideDirection}`;

  return (
    <div className={cardClass}>
      {/* Meta row */}
      <div className="question-meta">
        <span className="question-counter">
          {questionNumber} <span className="question-counter__sep">/</span> {totalQuestions}
        </span>
        {!question.required && (
          <span className="question-optional-badge">Optional</span>
        )}
      </div>

      {/* Heading */}
      <h2 className="question-heading">{question.question}</h2>
      {question.hint && <p className="question-hint">{question.hint}</p>}

      {/* Error */}
      {error && (
        <p className="form-error question-error" role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}

      {/* Input area */}
      <div className="question-body">

        {/* TEXT */}
        {(question.type === 'text' || question.type === 'text-autofill') && (
          <>
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              id={question.id}
              list={question.type === 'text-autofill' ? `${question.id}-list` : undefined}
              className={question.id === 'q_name' ? 'input-name-large' : ''}
              value={strVal}
              placeholder={question.placeholder ?? ''}
              onChange={e => onChange(question.id, e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onNext(); }}
              autoComplete="off"
            />
            {question.type === 'text-autofill' && question.datalistOptions && (
              <datalist id={`${question.id}-list`}>
                {question.datalistOptions.map(o => <option key={o} value={o} />)}
              </datalist>
            )}
            {/* Auto-fill badge for degree */}
            {question.id === 'q_degree' && strVal && getDegreeMatch(allAnswers, strVal) && (
              <div style={{ marginTop: 8 }}>
                <span className="badge-autofill">✦ Auto-filled</span>
              </div>
            )}
          </>
        )}

        {/* DATE */}
        {question.type === 'date' && (
          <input
            type="date"
            id={question.id}
            value={strVal}
            onChange={e => onChange(question.id, e.target.value)}
          />
        )}

        {/* TEXTAREA */}
        {question.type === 'textarea' && (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            id={question.id}
            rows={question.rows ?? 3}
            value={strVal}
            placeholder={question.placeholder ?? ''}
            onChange={e => onChange(question.id, e.target.value)}
          />
        )}

        {/* SINGLE SELECT DROPDOWN */}
        {question.type === 'single-select-dropdown' && (
          <select
            id={question.id}
            value={strVal}
            onChange={e => onChange(question.id, e.target.value)}
          >
            <option value="">Choose one…</option>
            {question.optionGroups
              ? question.optionGroups.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                ))
              : question.options?.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))
            }
          </select>
        )}

        {/* SINGLE SELECT CARD */}
        {question.type === 'single-select-card' && (
          <div
            className={`option-cards-grid option-cards-grid--cols-${question.columns ?? 1}`}
            role="radiogroup"
            aria-label={question.question}
          >
            {question.options?.map(opt => (
              <div
                key={opt.value}
                className={`option-card-full${strVal === opt.value ? ' option-card-full--selected' : ''}`}
                role="radio"
                aria-checked={strVal === opt.value}
                tabIndex={0}
                onClick={() => handleCardSelect(opt.value)}
                onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleCardSelect(opt.value); } }}
              >
                <div className="option-card-full__indicator" aria-hidden="true" />
                <div className="option-card-full__content">
                  <span className="option-card-full__label">{opt.label}</span>
                  {opt.description && (
                    <span className="option-card-full__desc">{opt.description}</span>
                  )}
                </div>
                {strVal === opt.value && (
                  <div className="option-card-full__check" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MULTI SELECT PILL */}
        {question.type === 'multi-select-pill' && (
          <>
            <div className="pill-grid" role="group" aria-label={question.question}>
              {question.options?.map(opt => (
                <PillCheckbox
                  key={opt.value}
                  label={opt.label}
                  selected={arrVal.includes(opt.value)}
                  onToggle={() => togglePill(opt.value)}
                />
              ))}
            </div>
            {arrVal.length > 0 && (
              <p className="selection-count">{arrVal.length} selected</p>
            )}
          </>
        )}

        {/* CATEGORIZED MULTI SELECT */}
        {question.type === 'categorized-multi-select' && (
          <>
            {CAREER_INTEREST_CATEGORIES.map(cat => (
              <div key={cat.category} className="categorized-group">
                <div className="category-label">{cat.category}</div>
                <div className="pill-grid">
                  {cat.careers.map(career => (
                    <PillCheckbox
                      key={career}
                      label={career}
                      selected={arrVal.includes(career)}
                      onToggle={() => togglePill(career)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {arrVal.length > 0 && (
              <p className="selection-count">{arrVal.length} selected</p>
            )}
          </>
        )}
      </div>

      {/* Navigation — hidden for auto-advance card selects */}
      {question.type !== 'single-select-card' && (
        <div className="question-nav">
          {!isFirst && (
            <button type="button" className="btn-secondary" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={onNext}
            style={isFirst ? { marginLeft: 'auto' } : {}}
          >
            {question.required ? 'Continue' : 'Continue'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}

      {/* Back only — for card selects (auto-advance on pick, but back still needed) */}
      {question.type === 'single-select-card' && !isFirst && (
        <div className="question-nav question-nav--back-only">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
          {strVal && (
            <button type="button" className="btn-primary" onClick={onNext}>
              Continue
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* First question, card type (no back) */}
      {question.type === 'single-select-card' && isFirst && strVal && (
        <div className="question-nav question-nav--right">
          <button type="button" className="btn-primary" onClick={onNext}>
            Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function getDegreeMatch(answers: AnswerMap, currentDegreeVal: string): boolean {
  const auto = getDegreeForProgram((answers.q_program_studied as string) ?? '');
  return !!auto && auto === currentDegreeVal;
}
