import { Checkbox } from "@/components/ui/checkbox";
import { FilterSectionHeader } from "./FilterSectionHeader";

interface CutFilterProps {
  selectedCuts: string[];
  onCutToggle: (cut: string) => void;
}

const cutGrades = [
  "Excellent",
  "Very Good", 
  "Good",
  "Fair",
  "Poor"
];

export function CutFilter({ selectedCuts, onCutToggle }: CutFilterProps) {
  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Cut</h3>
        {selectedCuts.length > 0 && (
          <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-md font-medium">
            {selectedCuts.length} selected
          </span>
        )}
      </div>
      
      {/* Enlarged cut selectors */}
      <div className="space-y-3">
        {cutGrades.map((cut) => (
          <button
            key={cut}
            onClick={() => onCutToggle(cut)}
            className={`w-full px-4 py-3.5 text-base font-semibold rounded-xl border-2 transition-all text-left min-h-[52px] touch-target shadow-sm ${
              selectedCuts.includes(cut)
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 shadow-lg scale-105 transform"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-blue-400 hover:scale-105"
            }`}
          >
            {cut}
          </button>
        ))}
      </div>
    </div>
  );
}