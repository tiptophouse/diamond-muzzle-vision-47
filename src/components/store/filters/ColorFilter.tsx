
interface ColorFilterProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

export function ColorFilter({ selectedColors, onColorToggle }: ColorFilterProps) {
  return (
    <div className="space-y-3 bg-card p-3 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Color</h3>
        {selectedColors.length > 0 && (
          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
            {selectedColors.length}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-1">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorToggle(color)}
            className={`px-2 py-1.5 text-xs font-medium rounded border transition-all ${
              selectedColors.includes(color)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}
