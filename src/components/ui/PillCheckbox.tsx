interface PillCheckboxProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export default function PillCheckbox({ label, selected, onToggle }: PillCheckboxProps) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      type="button"
      className={`pill${selected ? ' pill--selected' : ''}`}
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      onKeyDown={handleKey}
    >
      {selected && <span className="pill__check" aria-hidden="true">✓</span>}
      {label}
    </button>
  );
}
