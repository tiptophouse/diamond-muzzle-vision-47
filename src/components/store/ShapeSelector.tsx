
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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
      {SHAPES.map(({ name, icon: Icon, label }) => {
        const isSelected = selectedShapes.includes(name);
        return (
          <button
            key={name}
            onClick={() => onShapeToggle(name)}
            className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 min-h-[64px] hover:shadow-md hover:scale-105 touch-target ${
              isSelected
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 text-blue-600 shadow-md scale-105"
                : "border-border/40 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600"
            }`}
          >
            {/* Premium background gradient */}
            <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
              isSelected ? "opacity-20" : "group-hover:opacity-10"
            } bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-transparent`} />
            
            {/* Icon container - slightly smaller but still easy to tap */}
            <div className="relative z-10 mb-1">
              <Icon className="h-5 w-5 transition-all duration-300" />
            </div>
            
            {/* Text with proper styling */}
            <span className={`relative z-10 text-xs font-medium text-center leading-tight transition-all duration-300 ${
              isSelected ? "text-blue-600" : "text-muted-foreground group-hover:text-blue-600"
            }`}>
              <span className="block truncate max-w-full px-0.5">
                {label}
              </span>
            </span>

            {/* Selection indicator dot */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse">
                <div className="w-full h-full bg-blue-400 rounded-full opacity-60 animate-ping" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
