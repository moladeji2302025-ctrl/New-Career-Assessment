interface StepIndicatorProps {
  currentStep: number;
}

const STEPS = [
  { label: 'Welcome' },
  { label: 'Group' },
  { label: 'Info' },
  { label: 'Interests' },
  { label: 'Review' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator" role="list">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const done = n < currentStep;
        const active = n === currentStep;
        const cls = done ? 'step-pill step-pill--done' : active ? 'step-pill step-pill--active' : 'step-pill';
        return (
          <div key={n} role="listitem" style={{ display: 'contents' }}>
            <div className={cls} aria-current={active ? 'step' : undefined}>
              <span className="step-pill__number">
                {done ? '✓' : n}
              </span>
              <span className="step-pill__label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="step-connector" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
