
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MobileSelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function MobileSelectField({ 
  id, 
  label, 
  value, 
  options, 
  onValueChange, 
  placeholder 
}: MobileSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-lg font-medium text-gray-900 mb-2">
        {label}
      </label>
      
      <button
        type="button"
        onClick={handleTriggerClick}
        className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-between text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg text-gray-900">
          {value || placeholder || 'Select...'}
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-3 text-left text-lg hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
