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
    <div className="space-y-3 bg-card p-3 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Cut</h3>
        {selectedCuts.length > 0 && (
          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
            {selectedCuts.length}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {cutGrades.map((cut) => (
          <button
            key={cut}
            onClick={() => onCutToggle(cut)}
            className={`w-full px-2 py-1.5 text-xs font-medium rounded border transition-all text-left ${
              selectedCuts.includes(cut)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {cut}
          </button>
        ))}
      </div>
    </div>
  );
}