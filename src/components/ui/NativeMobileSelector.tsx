import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NativeMobileSelectorProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  columns?: number;
}

export function NativeMobileSelector({ 
  id, 
  label, 
  value, 
  onValueChange, 
  options, 
  columns = 3 
}: NativeMobileSelectorProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base font-medium text-foreground">
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
              "min-h-[48px] px-3 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "active:scale-95 touch-manipulation",
              "flex items-center justify-center text-center",
              "overflow-hidden text-ellipsis whitespace-nowrap",
              "leading-tight",
              value === option
                ? "bg-primary text-primary-foreground border-primary shadow-lg transform scale-105"
                : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <span className="truncate w-full">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}