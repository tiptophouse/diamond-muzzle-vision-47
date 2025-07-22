import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TelegramSortSheetProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: "most-popular", label: "Most Popular" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "carat-low-high", label: "Carat: Low to High" },
  { value: "carat-high-low", label: "Carat: High to Low" },
  { value: "newest", label: "Newest" },
];

export function TelegramSortSheet({ currentSort, onSortChange }: TelegramSortSheetProps) {
  return (
    <div className="p-4 space-y-2">
      {sortOptions.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          className={`w-full justify-between h-12 px-4 ${
            currentSort === option.value 
              ? 'bg-primary/10 text-primary border border-primary/20' 
              : 'text-foreground hover:bg-muted'
          }`}
          onClick={() => onSortChange(option.value)}
        >
          <span className="font-medium">{option.label}</span>
          {currentSort === option.value && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </Button>
      ))}
    </div>
  );
}