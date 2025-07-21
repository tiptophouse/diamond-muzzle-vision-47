
import { RealisticRoundIcon } from "./shapes/RealisticRoundIcon";
import { RealisticPrincessIcon } from "./shapes/RealisticPrincessIcon";
import { CushionIcon } from "./shapes/CushionIcon";
import { RealisticEmeraldIcon } from "./shapes/RealisticEmeraldIcon";
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
  { name: "Round", icon: RealisticRoundIcon, label: "Round" },
  { name: "Princess", icon: RealisticPrincessIcon, label: "Princess" },
  { name: "Cushion", icon: CushionIcon, label: "Cushion" },
  { name: "Emerald", icon: RealisticEmeraldIcon, label: "Emerald" },
  { name: "Oval", icon: OvalIcon, label: "Oval" },
  { name: "Radiant", icon: RadiantIcon, label: "Radiant" },
  { name: "Asscher", icon: AsscherIcon, label: "Asscher" },
  { name: "Marquise", icon: MarquiseIcon, label: "Marquise" },
  { name: "Heart", icon: HeartIcon, label: "Heart" },
  { name: "Pear", icon: PearIcon, label: "Pear" },
];

export function ShapeSelector({ selectedShapes, onShapeToggle }: ShapeSelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
      {SHAPES.map(({ name, icon: Icon, label }) => {
        const isSelected = selectedShapes.includes(name);
        return (
          <button
            key={name}
            onClick={() => onShapeToggle(name)}
            className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 min-h-[64px] hover:shadow-md hover:scale-105 touch-target ${
              isSelected
                ? "border-primary bg-gradient-to-br from-primary/10 to-primary-glow/10 text-primary shadow-lg scale-105"
                : "border-border/40 bg-white hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            }`}
          >
            {/* Premium background gradient */}
            <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
              isSelected ? "opacity-30" : "group-hover:opacity-15"
            } bg-gradient-to-br from-primary/20 via-primary-glow/10 to-transparent`} />
            
            {/* Icon container - slightly smaller but still easy to tap */}
            <div className="relative z-10 mb-1">
              <Icon className="h-5 w-5 transition-all duration-300" />
            </div>
            
            {/* Text with proper styling */}
            <span className={`relative z-10 text-xs font-medium text-center leading-tight transition-all duration-300 ${
              isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            }`}>
              <span className="block truncate max-w-full px-0.5">
                {label}
              </span>
            </span>

            {/* Selection indicator dot */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full shadow-lg animate-pulse">
                <div className="w-full h-full bg-primary-glow rounded-full opacity-60 animate-ping" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
