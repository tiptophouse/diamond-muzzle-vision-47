
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DiamondFormData } from './types';

interface DiamondInputFieldProps {
  id: keyof DiamondFormData;
  label: string;
  type?: string;
  step?: string;
  placeholder: string;
  register: UseFormRegister<DiamondFormData>;
  validation?: object;
  errors: FieldErrors<DiamondFormData>;
}

export function DiamondInputField({ 
  id, 
  label, 
  type = "text", 
  step, 
  placeholder, 
  register, 
  validation = {}, 
  errors 
}: DiamondInputFieldProps) {
  // Handle number field transformation
  const registerOptions = type === 'number' 
    ? {
        ...validation,
        setValueAs: (value: string) => value === '' ? 0 : Number(value)
      }
    : validation;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        step={step}
        {...register(id, registerOptions)}
        placeholder={placeholder}
      />
      {errors[id] && (
        <p className="text-sm text-red-600 mt-1">{errors[id]?.message}</p>
      )}
    </div>
  );
}
