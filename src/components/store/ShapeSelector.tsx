
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
    <div className="grid grid-cols-5 gap-3">
      {SHAPES.map(({ name, icon: Icon, label }) => {
        const isSelected = selectedShapes.includes(name);
        return (
          <button
            key={name}
            onClick={() => onShapeToggle(name)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:shadow-md ${
              isSelected
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
