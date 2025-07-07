
import React from 'react';
import { UseFormRegister, FieldErrors, RegisterOptions } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';

interface MobileInputFieldProps {
  id: keyof DiamondFormData;
  label: string;
  type?: string;
  step?: string;
  placeholder?: string;
  register: UseFormRegister<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
  validation?: RegisterOptions<DiamondFormData>;
}

export function MobileInputField({ 
  id, 
  label, 
  type = "text", 
  step, 
  placeholder, 
  register, 
  errors, 
  validation 
}: MobileInputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-medium text-gray-900 mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        step={step}
        placeholder={placeholder}
        {...register(id, validation)}
        className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {errors[id] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[id]?.message}
        </p>
      )}
    </div>
  );
}
