import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DiamondFormData } from './types';
import { cn } from '@/lib/utils';

interface AutocompleteInputFieldProps {
  id: keyof DiamondFormData;
  label: string;
  placeholder: string;
  suggestions: string[];
  register: UseFormRegister<DiamondFormData>;
  validation?: object;
  errors: FieldErrors<DiamondFormData>;
  value?: string;
  onChange?: (value: string) => void;
}

export function AutocompleteInputField({ 
  id, 
  label, 
  placeholder, 
  suggestions,
  register, 
  validation = {}, 
  errors,
  value,
  onChange
}: AutocompleteInputFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSuggestions([]);
      setIsOpen(false);
      return;
    }

    const query = inputValue.toLowerCase();
    const filtered = suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query) && 
      suggestion.toLowerCase() !== query
    );
    
    setFilteredSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    setIsOpen(filtered.length > 0);
    setSelectedIndex(-1);
  }, [inputValue, suggestions]);

  // Update input value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange?.(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
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
    <div className="relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          {...register(id, validation)}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          autoComplete="off"
        />
        
        {isOpen && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                ref={el => suggestionRefs.current[index] = el}
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm border-b border-border last:border-b-0",
                  selectedIndex === index 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      {errors[id] && (
        <p className="text-sm text-red-600 mt-1">{errors[id]?.message}</p>
      )}
    </div>
  );
}