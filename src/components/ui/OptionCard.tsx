interface OptionCardProps {
  label: string;
  value: string;
  selected: boolean;
  onChange: (value: string) => void;
  name: string;
}

export default function OptionCard({ label, value, selected, onChange, name }: OptionCardProps) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(value);
    }
  };

  return (
    <div
      className={`option-card${selected ? ' option-card--selected' : ''}`}
      role="radio"
      aria-checked={selected}
      aria-label={label}
      tabIndex={0}
      onClick={() => onChange(value)}
      onKeyDown={handleKey}
      data-name={name}
    >
      <span className="option-card__indicator" aria-hidden="true" />
      <span className="option-card__label">{label}</span>
    </div>
  );
}
