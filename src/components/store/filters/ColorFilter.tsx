
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
      
      {/* Enlarged color selectors - 4 columns instead of 5 for bigger buttons */}
      <div className="grid grid-cols-4 gap-3">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorToggle(color)}
            className={`px-4 py-3.5 text-base font-semibold rounded-xl border-2 transition-all min-h-[52px] touch-target shadow-sm ${
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
