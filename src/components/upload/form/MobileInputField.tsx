
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
  required?: boolean;
}

export function MobileInputField({ 
  id, 
  label, 
  type = "text", 
  step, 
  placeholder, 
  register, 
  errors, 
  validation,
  required = false
}: MobileInputFieldProps) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-lg font-semibold text-gray-900 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        step={step}
        placeholder={placeholder}
        {...register(id, validation)}
        className="w-full h-14 px-4 bg-white border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      />
      {errors[id] && (
        <p className="mt-2 text-base text-red-600 font-medium">
          {errors[id]?.message}
        </p>
      )}
    </div>
  );
}
