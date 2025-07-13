import { Checkbox } from "@/components/ui/checkbox";
import { FilterSectionHeader } from "./FilterSectionHeader";

interface FluorescenceFilterProps {
  selectedFluorescence: string[];
  onFluorescenceToggle: (fluorescence: string) => void;
}

const fluorescenceGrades = [
  "None",
  "Faint",
  "Medium", 
  "Strong",
  "Very Strong"
];

export function FluorescenceFilter({ selectedFluorescence, onFluorescenceToggle }: FluorescenceFilterProps) {
  return (
    <div className="space-y-3 bg-card p-3 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Fluorescence</h3>
        {selectedFluorescence.length > 0 && (
          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
            {selectedFluorescence.length}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {fluorescenceGrades.map((fluorescence) => (
          <button
            key={fluorescence}
            onClick={() => onFluorescenceToggle(fluorescence)}
            className={`w-full px-2 py-1.5 text-xs font-medium rounded border transition-all text-left ${
              selectedFluorescence.includes(fluorescence)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {fluorescence}
          </button>
        ))}
      </div>
    </div>
  );
}