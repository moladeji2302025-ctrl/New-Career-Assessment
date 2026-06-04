import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  badge?: ReactNode;
}

export default function FormField({ label, htmlFor, error, hint, children, badge }: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  return (
    <div className="form-field">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label className="form-label" htmlFor={htmlFor}>{label}</label>
        {badge}
      </div>
      {hint && <p className="form-hint">{hint}</p>}
      <div aria-describedby={error ? errorId : undefined}>
        {children}
      </div>
      {error && (
        <p className="form-error" id={errorId} role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}
