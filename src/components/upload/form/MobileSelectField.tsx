
import React from 'react';

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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-lg font-medium text-gray-900 mb-2">
        {label}
      </label>
      
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
