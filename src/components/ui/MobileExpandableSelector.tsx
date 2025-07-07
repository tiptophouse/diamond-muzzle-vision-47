import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileExpandableSelectorProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function MobileExpandableSelector({ 
  id, 
  label, 
  value, 
  onValueChange, 
  options,
  placeholder = "Select option"
}: MobileExpandableSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onValueChange(option);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-left",
            "bg-background border border-input rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "transition-all duration-200 touch-manipulation active:scale-[0.98]"
          )}
        >
          <span className={cn(
            "block truncate",
            !value ? "text-muted-foreground" : "text-foreground"
          )}>
            {value || placeholder}
          </span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </button>

        {isOpen && (
          <div className="border border-input rounded-md bg-background shadow-lg overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors duration-150",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    "touch-manipulation active:bg-accent/80",
                    value === option && "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}