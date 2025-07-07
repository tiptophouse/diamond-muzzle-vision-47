
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';

interface DetailedGradingSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function DetailedGradingSection({ register, setValue, watch, errors }: DetailedGradingSectionProps) {
  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Detailed Grading</h3>
      <p className="text-sm text-gray-600">Professional grading details from certificate</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DiamondInputField
          id="fluorescence"
          label="Fluorescence"
          placeholder="e.g., None, Faint, Medium, Strong"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="polish"
          label="Polish"
          placeholder="e.g., Excellent, Very Good, Good"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="symmetry"
          label="Symmetry"
          placeholder="e.g., Excellent, Very Good, Good"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="gridle"
          label="Girdle"
          placeholder="e.g., Medium, Thin, Thick"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="culet"
          label="Culet"
          placeholder="e.g., None, Small, Medium"
          register={register}
          errors={errors}
        />
      </div>
    </div>
  );
}
