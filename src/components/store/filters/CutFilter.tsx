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
    <div className="space-y-3">
      <FilterSectionHeader label="Cut Grade" count={selectedCuts.length} />
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {cutGrades.map((cut) => (
          <div key={cut} className="flex items-center space-x-3">
            <Checkbox
              id={`cut-${cut}`}
              checked={selectedCuts.includes(cut)}
              onCheckedChange={() => onCutToggle(cut)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor={`cut-${cut}`}
              className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
            >
              {cut}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}