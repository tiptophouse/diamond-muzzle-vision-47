
import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Option {
  value: string;
  label: string;
}

interface MobileFriendlySelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

export function MobileFriendlySelect({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select option",
  disabled = false
}: MobileFriendlySelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium text-gray-900">
        {label}
      </Label>
      
      {/* Mobile-optimized trigger button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full h-14 justify-between text-left text-base bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Mobile-optimized dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Options container */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-xl z-50 max-h-80 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{label}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500"
                >
                  Done
                </Button>
              </div>
            </div>
            
            {/* Options list */}
            <div className="p-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between p-4 text-left rounded-lg transition-colors ${
                    value === option.value
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base font-medium">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
