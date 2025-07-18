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
    <div className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Fluorescence</h3>
        {selectedFluorescence.length > 0 && (
          <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-md font-medium">
            {selectedFluorescence.length} selected
          </span>
        )}
      </div>
      
      {/* Enlarged fluorescence selectors */}
      <div className="space-y-4">
        {fluorescenceGrades.map((fluorescence) => (
          <button
            key={fluorescence}
            onClick={() => onFluorescenceToggle(fluorescence)}
            className={`w-full px-5 py-4 text-lg font-semibold rounded-xl border-2 transition-all text-left min-h-[60px] touch-target shadow-sm ${
              selectedFluorescence.includes(fluorescence)
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 shadow-lg scale-105 transform"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-blue-400 hover:scale-105"
            }`}
          >
            {fluorescence}
          </button>
        ))}
      </div>
    </div>
  );
}