import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MobileWheelPickerProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function MobileWheelPicker({ 
  id, 
  label, 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select option" 
}: MobileWheelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, options.indexOf(value)));
  const wheelRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40; // Height of each option
  const visibleItems = 5; // Number of visible items

  useEffect(() => {
    const index = options.indexOf(value);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [value, options]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onValueChange(options[index]);
    setIsOpen(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(options.length - 1, selectedIndex + delta));
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
      onValueChange(options[newIndex]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    let currentY = startY;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaY = currentY - touch.clientY;
      currentY = touch.clientY;

      if (Math.abs(deltaY) > 10) {
        const delta = deltaY > 0 ? 1 : -1;
        const newIndex = Math.max(0, Math.min(options.length - 1, selectedIndex + delta));
        if (newIndex !== selectedIndex) {
          setSelectedIndex(newIndex);
          onValueChange(options[newIndex]);
        }
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      
      <div className="relative">
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
          <div className="text-muted-foreground text-xs">▼</div>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Wheel Picker */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 overflow-hidden">
              <div className="p-3 text-center text-sm text-muted-foreground border-b">
                Scroll to select {label.toLowerCase()}
              </div>
              
              <div
                ref={wheelRef}
                className="relative overflow-hidden"
                style={{ height: itemHeight * visibleItems }}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
              >
                {/* Selection indicator */}
                <div 
                  className="absolute left-0 right-0 bg-accent/20 border-y border-accent"
                  style={{ 
                    top: itemHeight * Math.floor(visibleItems / 2),
                    height: itemHeight 
                  }}
                />
                
                {/* Options */}
                <div
                  className="transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateY(-${selectedIndex * itemHeight - itemHeight * Math.floor(visibleItems / 2)}px)`
                  }}
                >
                  {options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(index)}
                      className={cn(
                        "w-full px-3 py-2 text-center transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground",
                        "touch-manipulation active:bg-accent/80",
                        index === selectedIndex 
                          ? "text-primary font-semibold text-base scale-105" 
                          : "text-muted-foreground text-sm opacity-70"
                      )}
                      style={{ height: itemHeight }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}