import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NativeWheelPickerProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
}

export function NativeWheelPicker({ 
  id, 
  label, 
  value, 
  onValueChange, 
  options 
}: NativeWheelPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (option: string) => {
    onValueChange(option);
    setIsExpanded(false);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base font-medium text-foreground">
        {label}
      </Label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full min-h-[48px] px-4 py-3 text-base font-medium rounded-xl border-2 transition-all duration-200",
            "bg-card text-foreground border-border",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "flex items-center justify-between touch-manipulation",
            isExpanded && "border-primary"
          )}
        >
          <span>{value}</span>
          <ChevronDown 
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} 
          />
        </button>

        {isExpanded && (
          <div className="mt-2 bg-card border-2 border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full min-h-[48px] px-4 py-3 text-base font-medium text-left transition-colors touch-manipulation",
                  "hover:bg-accent hover:text-accent-foreground",
                  "first:rounded-t-xl last:rounded-b-xl",
                  "border-b border-border last:border-b-0",
                  value === option && "bg-primary text-primary-foreground font-semibold"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}