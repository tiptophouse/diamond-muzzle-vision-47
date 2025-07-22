import { Button } from "@/components/ui/button";

interface PolishFilterProps {
  selectedPolish: string[];
  onPolishToggle: (polish: string) => void;
}

const polishOptions = [
  "Excellent",
  "Very good", 
  "Good",
  "Fair",
  "N/A"
];

export function PolishFilter({ selectedPolish, onPolishToggle }: PolishFilterProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {polishOptions.map((polish) => (
        <Button
          key={polish}
          variant={selectedPolish.includes(polish) ? "default" : "outline"}
          size="sm"
          onClick={() => onPolishToggle(polish)}
          className={`h-10 text-sm ${
            selectedPolish.includes(polish)
              ? "bg-primary text-primary-foreground"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {polish}
        </Button>
      ))}
    </div>
  );
}