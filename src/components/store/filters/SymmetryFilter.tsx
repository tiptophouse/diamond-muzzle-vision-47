import { Button } from "@/components/ui/button";

interface SymmetryFilterProps {
  selectedSymmetry: string[];
  onSymmetryToggle: (symmetry: string) => void;
}

const symmetryOptions = [
  "Excellent",
  "Very good",
  "Good", 
  "Fair",
  "N/A"
];

export function SymmetryFilter({ selectedSymmetry, onSymmetryToggle }: SymmetryFilterProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {symmetryOptions.map((symmetry) => (
        <Button
          key={symmetry}
          variant={selectedSymmetry.includes(symmetry) ? "default" : "outline"}
          size="sm"
          onClick={() => onSymmetryToggle(symmetry)}
          className={`h-10 text-sm ${
            selectedSymmetry.includes(symmetry)
              ? "bg-primary text-primary-foreground"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {symmetry}
        </Button>
      ))}
    </div>
  );
}