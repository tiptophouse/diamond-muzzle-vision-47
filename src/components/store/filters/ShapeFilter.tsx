
import { Diamond } from "lucide-react";
import { ShapeSelector } from "../ShapeSelector";

interface ShapeFilterProps {
  selectedShapes: string[];
  onShapeToggle: (shape: string) => void;
}

export function ShapeFilter({ selectedShapes, onShapeToggle }: ShapeFilterProps) {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2">
        <Diamond className="h-4 w-4 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Shape</h3>
      </div>
      <ShapeSelector
        selectedShapes={selectedShapes}
        onShapeToggle={onShapeToggle}
      />
    </div>
  );
}
