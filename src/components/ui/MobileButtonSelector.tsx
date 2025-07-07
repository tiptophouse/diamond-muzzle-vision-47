import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MobileButtonSelectorProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  columns?: number;
}

export function MobileButtonSelector({ 
  id, 
  label, 
  value, 
  onValueChange, 
  options, 
  columns = 3 
}: MobileButtonSelectorProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <div 
        className={cn(
          "grid gap-2", 
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4"
        )}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onValueChange(option)}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 touch-manipulation",
              "active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              value === option
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}