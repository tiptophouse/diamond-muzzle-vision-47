
interface ColorFilterProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

export function ColorFilter({ selectedColors, onColorToggle }: ColorFilterProps) {
  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Color</h3>
        {selectedColors.length > 0 && (
          <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-md font-medium">
            {selectedColors.length} selected
          </span>
        )}
      </div>
      
      {/* Enlarged color selectors - 3 columns for bigger, more accessible buttons */}
      <div className="grid grid-cols-3 gap-4">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorToggle(color)}
            className={`px-5 py-4 text-lg font-semibold rounded-xl border-2 transition-all min-h-[60px] touch-target shadow-sm ${
              selectedColors.includes(color)
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 shadow-lg scale-105 transform"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-blue-400 hover:scale-105"
            }`}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}
