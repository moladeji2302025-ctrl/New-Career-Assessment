import { CAREER_INTEREST_CATEGORIES } from '../../data/organizationDepartments';
import PillCheckbox from './PillCheckbox';

interface CategorizedPillGroupProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function CategorizedPillGroup({ selected, onChange }: CategorizedPillGroupProps) {
  const toggle = (career: string) => {
    if (selected.includes(career)) {
      onChange(selected.filter(c => c !== career));
    } else {
      onChange([...selected, career]);
    }
  };

  return (
    <div>
      {CAREER_INTEREST_CATEGORIES.map(cat => (
        <div key={cat.category} className="categorized-group">
          <div className="category-label">{cat.category}</div>
          <div className="pill-grid">
            {cat.careers.map(career => (
              <PillCheckbox
                key={career}
                label={career}
                selected={selected.includes(career)}
                onToggle={() => toggle(career)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
