
import React from 'react';
import { UseFormRegister, FieldErrors, RegisterOptions } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DiamondFormData } from './types';

interface DiamondInputFieldProps {
  id: keyof DiamondFormData;
  label: string;
  type?: string;
  step?: string;
  placeholder?: string;
  register: UseFormRegister<DiamondFormData>;
  validation?: RegisterOptions;
  errors: FieldErrors<DiamondFormData>;
  disabled?: boolean;
}

export function DiamondInputField({
  id,
  label,
  type = 'text',
  step,
  placeholder,
  register,
  validation,
  errors,
  disabled = false
}: DiamondInputFieldProps) {
  const error = errors[id];

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium text-gray-900">
        {label}
        {validation?.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-14 text-base bg-white border-2 ${
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
        } transition-all`}
        {...register(id, validation)}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}
