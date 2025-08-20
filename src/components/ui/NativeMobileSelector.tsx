
import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

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
  const { hapticFeedback, isIOS } = useTelegramWebApp();

  const handleSelection = (option: string) => {
    hapticFeedback.impact('light');
    onValueChange(option);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor={id} className="text-base font-semibold text-foreground block">
        {label}
      </Label>
      <div 
        className={cn(
          "grid gap-3", 
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4"
        )}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelection(option)}
            className={cn(
              "min-h-[52px] px-4 py-3 text-base font-medium rounded-xl border-2 transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed",
              // Native iOS-style interactions
              "active:scale-95 active:brightness-95",
              // iPhone-specific enhancements
              isIOS && [
                "min-h-[56px]", // Even larger touch targets
                "shadow-sm active:shadow-none", // Subtle shadow effects
                "backdrop-blur-sm", // Modern iOS blur effect
              ],
              value === option
                ? [
                    "bg-primary text-primary-foreground border-primary",
                    "shadow-lg transform scale-105 ring-2 ring-primary/20",
                    isIOS && "shadow-primary/25"
                  ]
                : [
                    "bg-card text-foreground border-border",
                    "hover:border-primary/50 hover:bg-accent/50 hover:shadow-md",
                    isIOS && "bg-card/80 backdrop-blur-sm"
                  ]
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
