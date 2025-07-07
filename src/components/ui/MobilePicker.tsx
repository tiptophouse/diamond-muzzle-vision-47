import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface MobilePickerProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function MobilePicker({ 
  id, 
  label, 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select option" 
}: MobilePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onValueChange(option);
    setIsOpen(false);
  };

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={id} className="text-base font-medium text-foreground">
        {label}
      </Label>
      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full min-h-[48px] px-4 py-3 text-left text-base",
          "bg-background border-2 border-input rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "transition-all duration-200 touch-manipulation",
          "active:scale-[0.98] active:bg-accent/10",
          "flex items-center justify-between"
        )}
      >
        <span className={cn(
          "flex-1 truncate",
          !value ? "text-muted-foreground" : "text-foreground font-medium"
        )}>
          {value || placeholder}
        </span>
        <span className="text-muted-foreground ml-2 text-lg">▼</span>
      </button>

      {/* Mobile-First Bottom Sheet Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Mobile Bottom Sheet / Desktop Modal */}
          <div className={cn(
            "relative w-full bg-background rounded-t-2xl sm:rounded-2xl",
            "shadow-2xl border border-border",
            "max-w-sm sm:max-w-md mx-auto",
            "max-h-[70vh] sm:max-h-[60vh]",
            "animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 duration-300"
          )}>
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Select {label}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-accent rounded-full touch-manipulation"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-[50vh]">
              <div className="p-2">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full min-h-[48px] px-4 py-3 text-left text-base",
                      "rounded-lg transition-all duration-200 touch-manipulation",
                      "hover:bg-accent hover:text-accent-foreground",
                      "active:scale-[0.98] active:bg-accent/80",
                      "flex items-center justify-between",
                      "mb-1 last:mb-0",
                      value === option 
                        ? "bg-primary/10 text-primary font-medium border-2 border-primary/20" 
                        : "hover:bg-accent/50"
                    )}
                  >
                    <span className="flex-1">{option}</span>
                    {value === option && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Bottom Action */}
            <div className="p-4 border-t border-border sm:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full min-h-[48px] bg-primary text-primary-foreground rounded-lg font-medium text-base touch-manipulation active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}