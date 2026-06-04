import type { GroupType, ValidationErrors } from '../../types/assessment';

interface GroupSelectionProps {
  selected: GroupType | '';
  onSelect: (group: GroupType) => void;
  errors: ValidationErrors;
}

export default function GroupSelection({ selected, onSelect, errors }: GroupSelectionProps) {
  return (
    <div>
      <h2 className="step-title">What is your role?</h2>
      <p className="step-subtitle">Select the option that best describes you.</p>
      <div className="step-divider" aria-hidden="true" />

      <div className="group-cards" role="radiogroup" aria-label="Select your group">
        {/* IT Student Card */}
        <div
          className={`group-card${selected === 'IT_STUDENT' ? ' group-card--selected' : ''}`}
          role="radio"
          aria-checked={selected === 'IT_STUDENT'}
          tabIndex={0}
          onClick={() => onSelect('IT_STUDENT')}
          onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onSelect('IT_STUDENT'); } }}
        >
          {selected === 'IT_STUDENT' && (
            <div className="group-card__check" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          <svg className="group-card__icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M28 8 L50 20 L28 32 L6 20 Z" />
            <path d="M6 20 L6 36" />
            <path d="M50 20 L50 36" />
            <path d="M6 36 Q28 48 50 36" />
            <circle cx="6" cy="36" r="2" fill="currentColor" stroke="none" />
          </svg>
          <div className="group-card__title">IT Student</div>
          <div className="group-card__desc">
            Currently undergoing your IT internship as part of your degree programme.
          </div>
        </div>

        {/* NYSC Card */}
        <div
          className={`group-card${selected === 'NYSC_CORP_MEMBER' ? ' group-card--selected' : ''}`}
          role="radio"
          aria-checked={selected === 'NYSC_CORP_MEMBER'}
          tabIndex={0}
          onClick={() => onSelect('NYSC_CORP_MEMBER')}
          onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onSelect('NYSC_CORP_MEMBER'); } }}
        >
          {selected === 'NYSC_CORP_MEMBER' && (
            <div className="group-card__check" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          <svg className="group-card__icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M28 6 L46 16 L46 30 C46 40 28 50 28 50 C28 50 10 40 10 30 L10 16 Z" />
            <polyline points="20 28 26 34 38 22" />
          </svg>
          <div className="group-card__title">NYSC Corp Member</div>
          <div className="group-card__desc">
            Currently serving your mandatory one-year National Youth Service Corps programme.
          </div>
        </div>
      </div>

      {errors.group && (
        <p className="form-error" role="alert" style={{ marginTop: 12 }}>
          <span aria-hidden="true">⚠</span> {errors.group}
        </p>
      )}
    </div>
  );
}
