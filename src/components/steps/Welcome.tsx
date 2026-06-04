import FormField from '../ui/FormField';
import type { ValidationErrors } from '../../types/assessment';

interface WelcomeProps {
  respondentName: string;
  onChange: (name: string) => void;
  errors: ValidationErrors;
  onNext: () => void;
}

export default function Welcome({ respondentName, onChange, errors, onNext }: WelcomeProps) {
  return (
    <div>
      <h1 className="step-title">Tell us who you are.</h1>
      <p className="step-subtitle">
        This assessment helps us understand your career ambitions and provide personalised guidance.
      </p>
      <div className="step-divider" aria-hidden="true" />

      <FormField label="Full Name" htmlFor="respondentName" error={errors.respondentName}>
        <input
          id="respondentName"
          type="text"
          className="input-name-large"
          placeholder="Your full name"
          value={respondentName}
          onChange={e => onChange(e.target.value)}
          autoComplete="name"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') onNext(); }}
        />
      </FormField>

      <div className="nav-row nav-row--right" style={{ marginTop: 32 }}>
        <button type="button" className="btn-primary" onClick={onNext}>
          Continue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
