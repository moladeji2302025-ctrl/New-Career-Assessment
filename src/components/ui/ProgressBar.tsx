interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const pct = Math.round((step / totalSteps) * 100);
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
