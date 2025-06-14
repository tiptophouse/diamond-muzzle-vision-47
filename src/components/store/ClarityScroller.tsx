
interface ClarityScrollerProps {
  selectedClarities: string[];
  onClarityToggle: (clarity: string) => void;
}

const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1"];

export function ClarityScroller({ selectedClarities, onClarityToggle }: ClarityScrollerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {CLARITIES.map((clarity) => {
          const isSelected = selectedClarities.includes(clarity);
          return (
            <button
              key={clarity}
              onClick={() => onClarityToggle(clarity)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border-2 font-medium text-sm whitespace-nowrap transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {clarity}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-slate-500 text-center">
        Scroll horizontally to see all clarity grades (FL to I1)
      </div>
    </div>
  );
}
