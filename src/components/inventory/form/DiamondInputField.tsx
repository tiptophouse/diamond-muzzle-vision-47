
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
  
  // Special handling for price-related fields to ensure integers
  const getInputProps = () => {
    if (type === "number" && (id === "price" || id === "pricePerCarat")) {
      return {
        ...register(id, {
          ...validation,
          valueAsNumber: true,
          setValueAs: (value: string) => {
            // Convert to integer for price fields
            return Math.round(Number(value)) || 0;
          }
        }),
        step: "1", // Force step of 1 for integer inputs
        min: "0"
      };
    }
    
    if (type === "number") {
      return {
        ...register(id, {
          ...validation,
          valueAsNumber: true
        }),
        step: step || "0.01"
      };
    }
    
    return register(id, validation);
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...getInputProps()}
      />
      {errors[id] && (
        <p className="text-sm text-red-600 mt-1">{errors[id]?.message}</p>
      )}
    </div>
  );
}
