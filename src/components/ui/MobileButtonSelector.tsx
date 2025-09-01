
import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

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
  const { hapticFeedback, isIOS } = useTelegramWebApp();

  const handleSelection = (option: string) => {
    hapticFeedback.selection();
    onValueChange(option);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className={cn(
        "text-sm font-medium text-foreground block",
        isIOS && "text-base" // Larger text on iOS for better readability
      )}>
        {label}
      </Label>
      <div 
        className={cn(
          "grid gap-2", 
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4",
          isIOS && "gap-3" // More spacing on iOS
        )}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelection(option)}
            className={cn(
              "px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200",
              "touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              // iPhone-specific improvements
              isIOS && [
                "min-h-[48px] text-base", // Minimum touch target size and larger text
                "active:scale-90", // More pronounced scale effect
                "-webkit-tap-highlight-color: transparent" // Remove tap highlight
              ],
              value === option
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
