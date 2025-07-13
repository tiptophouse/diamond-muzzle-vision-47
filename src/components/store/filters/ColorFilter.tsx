
import { Button } from "@/components/ui/button";

interface ColorFilterProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

export function ColorFilter({ selectedColors, onColorToggle }: ColorFilterProps) {
  return (
    <div className="space-y-3 bg-card p-3 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gradient-to-r from-muted to-background border border-border rounded-full" />
        <h3 className="text-sm font-medium text-foreground">Color</h3>
      </div>
      
      <div className="grid grid-cols-5 gap-1">
        {COLORS.map((color) => (
          <Button
            key={color}
            variant={selectedColors.includes(color) ? "default" : "outline"}
            size="sm"
            className={`h-8 p-0 text-xs font-medium transition-all ${
              selectedColors.includes(color) 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            onClick={() => onColorToggle(color)}
          >
            {color}
          </Button>
        ))}
      </div>
    </div>
  );
}
