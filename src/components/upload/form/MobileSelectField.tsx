
import React from 'react';

interface MobileSelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function MobileSelectField({ 
  id, 
  label, 
  value, 
  options, 
  onValueChange, 
  placeholder,
  required = false,
  error
}: MobileSelectFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange(e.target.value);
  };

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-lg font-semibold text-gray-900 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="w-full h-14 px-4 bg-white border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
      
      {error && (
        <p className="mt-2 text-base text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
