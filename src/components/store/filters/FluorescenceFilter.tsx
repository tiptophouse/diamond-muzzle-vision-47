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
    <div className="space-y-3">
      <FilterSectionHeader label="Fluorescence" count={selectedFluorescence.length} />
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {fluorescenceGrades.map((fluorescence) => (
          <div key={fluorescence} className="flex items-center space-x-3">
            <Checkbox
              id={`fluorescence-${fluorescence}`}
              checked={selectedFluorescence.includes(fluorescence)}
              onCheckedChange={(checked) => {
                if (checked !== 'indeterminate') {
                  onFluorescenceToggle(fluorescence);
                }
              }}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor={`fluorescence-${fluorescence}`}
              className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onFluorescenceToggle(fluorescence);
              }}
            >
              {fluorescence}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}