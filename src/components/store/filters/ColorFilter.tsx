
import { Button } from "@/components/ui/button";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

interface ColorFilterProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

// Color descriptions for better UX
const COLOR_DESCRIPTIONS = {
  'D': 'Colorless',
  'E': 'Colorless', 
  'F': 'Colorless',
  'G': 'Near Colorless',
  'H': 'Near Colorless',
  'I': 'Near Colorless',
  'J': 'Near Colorless',
  'K': 'Faint Yellow',
  'L': 'Faint Yellow',
  'M': 'Faint Yellow'
};

export function ColorFilter({ selectedColors, onColorToggle }: ColorFilterProps) {
  const { hapticFeedback } = useTelegramWebApp();

  const handleColorSelect = (color: string) => {
    hapticFeedback.impact('light');
    onColorToggle(color);
  };

  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gradient-to-r from-yellow-50 to-white border border-border rounded-full" />
        <h3 className="text-base font-medium text-foreground">Color Grade</h3>
      </div>
      
      {/* Mobile-first responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {COLORS.map((color) => {
          const isSelected = selectedColors.includes(color);
          return (
            <Button
              key={color}
              variant={isSelected ? "default" : "outline"}
              className={`
                h-14 p-3 rounded-xl transition-all duration-200 transform active:scale-95
                ${isSelected 
                  ? "bg-primary text-primary-foreground shadow-lg border-2 border-primary" 
                  : "bg-background border-2 border-muted text-foreground hover:bg-muted hover:border-primary/50"
                }
              `}
              onClick={() => handleColorSelect(color)}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold">{color}</span>
                <span className="text-xs opacity-80 leading-tight text-center">
                  {COLOR_DESCRIPTIONS[color as keyof typeof COLOR_DESCRIPTIONS]}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
      
      {/* Selected count indicator */}
      {selectedColors.length > 0 && (
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {selectedColors.length} color{selectedColors.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </div>
  );
}
