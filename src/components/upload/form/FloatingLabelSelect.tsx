
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FloatingLabelSelectProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  error?: string;
}

export function FloatingLabelSelect({ 
  id, 
  label, 
  value, 
  options, 
  onValueChange, 
  error 
}: FloatingLabelSelectProps) {
  const isRequired = label.includes('*');
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          className={`
            peer w-full h-16 px-4 pt-7 pb-3 pr-12 bg-white border-2 border-gray-200 rounded-xl
            text-base text-gray-900 appearance-none touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
      </div>
      
      <label
        htmlFor={id}
        className={`
          absolute left-4 top-2 text-xs font-semibold text-gray-600
          transition-all duration-200 ease-in-out pointer-events-none
          peer-focus:text-blue-600
          ${error ? 'text-red-600 peer-focus:text-red-600' : ''}
          ${isRequired ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}
        `}
      >
        {label.replace(' *', '')}
      </label>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
