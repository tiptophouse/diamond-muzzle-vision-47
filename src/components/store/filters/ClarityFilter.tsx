
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClarityFilterProps {
  selectedClarities: string[];
  onClarityToggle: (clarity: string) => void;
}

const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];

export function ClarityFilter({ selectedClarities, onClarityToggle }: ClarityFilterProps) {
  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Clarity</h3>
        {selectedClarities.length > 0 && (
          <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-md font-medium">
            {selectedClarities.length} selected
          </span>
        )}
      </div>
      
      {/* Enlarged clarity selectors with better spacing */}
      <div className="grid grid-cols-3 gap-4">
        {CLARITIES.map((clarity) => (
          <button
            key={clarity}
            onClick={() => onClarityToggle(clarity)}
            className={`px-5 py-4 text-lg font-semibold rounded-xl border-2 transition-all min-h-[60px] touch-target shadow-sm ${
              selectedClarities.includes(clarity)
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 shadow-lg scale-105 transform"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-blue-400 hover:scale-105"
            }`}
          >
            {clarity}
          </button>
        ))}
      </div>
    </div>
  );
}
