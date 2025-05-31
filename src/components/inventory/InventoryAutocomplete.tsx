
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Diamond } from "./InventoryTable";
import { cn } from "@/lib/utils";

interface InventoryAutocompleteProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  allDiamonds: Diamond[];
}

interface Suggestion {
  type: 'stock' | 'shape' | 'color' | 'clarity';
  value: string;
  label: string;
}

export function InventoryAutocomplete({ 
  searchQuery, 
  onSearchChange, 
  onSubmit, 
  allDiamonds 
}: InventoryAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate suggestions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const newSuggestions: Suggestion[] = [];

    // Get unique values for each category
    const stockNumbers = [...new Set(allDiamonds.map(d => d.stockNumber))];
    const shapes = [...new Set(allDiamonds.map(d => d.shape))];
    const colors = [...new Set(allDiamonds.map(d => d.color))];
    const clarities = [...new Set(allDiamonds.map(d => d.clarity))];

    // Add matching stock numbers
    stockNumbers
      .filter(stock => stock.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach(stock => {
        newSuggestions.push({
          type: 'stock',
          value: stock,
          label: `Stock: ${stock}`
        });
      });

    // Add matching shapes
    shapes
      .filter(shape => shape.toLowerCase().includes(query))
      .slice(0, 2)
      .forEach(shape => {
        newSuggestions.push({
          type: 'shape',
          value: shape,
          label: `Shape: ${shape}`
        });
      });

    // Add matching colors
    colors
      .filter(color => color.toLowerCase().includes(query))
      .slice(0, 2)
      .forEach(color => {
        newSuggestions.push({
          type: 'color',
          value: color,
          label: `Color: ${color}`
        });
      });

    // Add matching clarity grades
    clarities
      .filter(clarity => clarity.toLowerCase().includes(query))
      .slice(0, 2)
      .forEach(clarity => {
        newSuggestions.push({
          type: 'clarity',
          value: clarity,
          label: `Clarity: ${clarity}`
        });
      });

    setSuggestions(newSuggestions.slice(0, 8)); // Limit to 8 suggestions
    setIsOpen(newSuggestions.length > 0);
    setSelectedIndex(-1);
  }, [searchQuery, allDiamonds]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          onSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onSearchChange(suggestion.value);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => setIsOpen(false), 150);
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  return (
    <div className="relative flex-1">
      <form onSubmit={onSubmit} className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search by stock number, shape, color, clarity..."
          className="pl-8"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoComplete="off"
        />
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.value}`}
              ref={el => suggestionRefs.current[index] = el}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm border-b border-border last:border-b-0",
                selectedIndex === index 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent/50"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-sm font-medium",
                  suggestion.type === 'stock' && "bg-blue-100 text-blue-700",
                  suggestion.type === 'shape' && "bg-green-100 text-green-700",
                  suggestion.type === 'color' && "bg-purple-100 text-purple-700",
                  suggestion.type === 'clarity' && "bg-orange-100 text-orange-700"
                )}>
                  {suggestion.type.toUpperCase()}
                </span>
                <span>{suggestion.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
