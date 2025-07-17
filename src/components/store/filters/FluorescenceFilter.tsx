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
      
      <div className="space-y-2">
        {fluorescenceGrades.map((fluorescence) => (
          <button
            key={fluorescence}
            onClick={() => onFluorescenceToggle(fluorescence)}
            className={`w-full px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all text-left min-h-[44px] touch-target ${
              selectedFluorescence.includes(fluorescence)
                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-primary/40"
            }`}
          >
            {fluorescence}
          </button>
        ))}
      </div>
    </div>
  );
}