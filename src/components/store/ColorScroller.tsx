
interface ColorScrollerProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

const COLORS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];

export function ColorScroller({ selectedColors, onColorToggle }: ColorScrollerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {COLORS.map((color) => {
          const isSelected = selectedColors.includes(color);
          return (
            <button
              key={color}
              onClick={() => onColorToggle(color)}
              className={`flex-shrink-0 w-12 h-12 rounded-full border-2 font-semibold text-sm transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {color}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-slate-500 text-center">
        Scroll horizontally to see all color grades (D to M)
      </div>
    </div>
  );
}
