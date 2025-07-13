
import { RoundIcon } from "./shapes/RoundIcon";
import { PrincessIcon } from "./shapes/PrincessIcon";
import { CushionIcon } from "./shapes/CushionIcon";
import { EmeraldIcon } from "./shapes/EmeraldIcon";
import { OvalIcon } from "./shapes/OvalIcon";
import { RadiantIcon } from "./shapes/RadiantIcon";
import { AsscherIcon } from "./shapes/AsscherIcon";
import { MarquiseIcon } from "./shapes/MarquiseIcon";
import { HeartIcon } from "./shapes/HeartIcon";
import { PearIcon } from "./shapes/PearIcon";

interface ShapeSelectorProps {
  selectedShapes: string[];
  onShapeToggle: (shape: string) => void;
}

const SHAPES = [
  { name: "Round", icon: RoundIcon, label: "Round" },
  { name: "Princess", icon: PrincessIcon, label: "Princess" },
  { name: "Cushion", icon: CushionIcon, label: "Cushion" },
  { name: "Emerald", icon: EmeraldIcon, label: "Emerald" },
  { name: "Oval", icon: OvalIcon, label: "Oval" },
  { name: "Radiant", icon: RadiantIcon, label: "Radiant" },
  { name: "Asscher", icon: AsscherIcon, label: "Asscher" },
  { name: "Marquise", icon: MarquiseIcon, label: "Marquise" },
  { name: "Heart", icon: HeartIcon, label: "Heart" },
  { name: "Pear", icon: PearIcon, label: "Pear" },
];

export function ShapeSelector({ selectedShapes, onShapeToggle }: ShapeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {SHAPES.map(({ name, icon: Icon, label }) => {
        const isSelected = selectedShapes.includes(name);
        return (
          <button
            key={name}
            onClick={() => onShapeToggle(name)}
            className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 min-h-[80px] sm:min-h-[90px] hover:shadow-lg hover:scale-105 ${
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-lg scale-105"
                : "border-border/40 bg-card/50 hover:border-border/60 hover:bg-card/80"
            }`}
          >
            {/* Premium background gradient */}
            <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
              isSelected ? "opacity-20" : "group-hover:opacity-10"
            } bg-gradient-to-br from-primary/20 via-primary/10 to-transparent`} />
            
            {/* Icon container with proper sizing */}
            <div className="relative z-10 mb-1.5 sm:mb-2">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300" />
            </div>
            
            {/* Text with proper truncation handling */}
            <span className={`relative z-10 text-xs sm:text-sm font-medium text-center leading-tight transition-all duration-300 ${
              isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            }`}>
              <span className="block truncate max-w-full px-1">
                {label}
              </span>
            </span>

            {/* Selection indicator dot */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full shadow-lg animate-pulse">
                <div className="w-full h-full bg-primary rounded-full opacity-60 animate-ping" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
