
import { Circle, Square, Diamond } from "lucide-react";

interface ShapeSelectorProps {
  selectedShapes: string[];
  onShapeToggle: (shape: string) => void;
}

const SHAPES = [
  { name: "Round", icon: Circle, label: "Round" },
  { name: "Princess", icon: Square, label: "Princess" },
  { name: "Cushion", icon: Square, label: "Cushion" },
  { name: "Emerald", icon: Square, label: "Emerald" },
  { name: "Oval", icon: Circle, label: "Oval" },
  { name: "Radiant", icon: Diamond, label: "Radiant" },
  { name: "Asscher", icon: Square, label: "Asscher" },
  { name: "Marquise", icon: Circle, label: "Marquise" },
  { name: "Heart", icon: Circle, label: "Heart" },
  { name: "Pear", icon: Circle, label: "Pear" },
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
