import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileSearchSelectorProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
}

export function MobileSearchSelector({ 
  id, 
  label, 
  value, 
  onValueChange, 
  options,
  placeholder = "Select option",
  searchPlaceholder = "Search..."
}: MobileSearchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (option: string) => {
    onValueChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleToggle}
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
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>

        {isOpen && (
          <div className="border border-input rounded-md bg-background shadow-lg overflow-hidden">
            <div className="p-2 border-b border-border">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full"
                autoFocus
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
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
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}