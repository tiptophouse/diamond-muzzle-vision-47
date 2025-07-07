
import React, { forwardRef } from 'react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const isRequired = label.includes('*');
    
    return (
      <div className="relative">
        <input
          ref={ref}
          className={`
            peer w-full h-16 px-4 pt-7 pb-3 bg-white border-2 border-gray-200 rounded-xl
            text-base text-gray-900 placeholder-transparent
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            touch-manipulation
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className || ''}
          `}
          placeholder={label}
          {...props}
        />
        <label
          htmlFor={props.id}
          className={`
            absolute left-4 top-2 text-xs font-semibold text-gray-600
            transition-all duration-200 ease-in-out pointer-events-none
            peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-400
            peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-600
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
);

FloatingLabelInput.displayName = 'FloatingLabelInput';
