
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { AutocompleteInputField } from '@/components/inventory/form/AutocompleteInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { 
  fluorescences, 
  polishGrades, 
  symmetryGrades, 
  girdleTypes, 
  culetGrades 
} from '@/components/inventory/form/diamondFormConstants';

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
        <AutocompleteInputField
          id="fluorescence"
          label="Fluorescence"
          placeholder="Type fluorescence (e.g., None)"
          suggestions={fluorescences}
          register={register}
          value={watch('fluorescence') || ''}
          onChange={(value) => setValue('fluorescence', value)}
          errors={errors}
        />

        <AutocompleteInputField
          id="polish"
          label="Polish"
          placeholder="Type polish grade (e.g., Excellent)"
          suggestions={polishGrades}
          register={register}
          value={watch('polish') || ''}
          onChange={(value) => setValue('polish', value)}
          errors={errors}
        />

        <AutocompleteInputField
          id="symmetry"
          label="Symmetry"
          placeholder="Type symmetry grade (e.g., Excellent)"
          suggestions={symmetryGrades}
          register={register}
          value={watch('symmetry') || ''}
          onChange={(value) => setValue('symmetry', value)}
          errors={errors}
        />

        <AutocompleteInputField
          id="gridle"
          label="Girdle"
          placeholder="Type girdle (e.g., Medium)"
          suggestions={girdleTypes}
          register={register}
          value={watch('gridle') || ''}
          onChange={(value) => setValue('gridle', value)}
          errors={errors}
        />

        <AutocompleteInputField
          id="culet"
          label="Culet"
          placeholder="Type culet (e.g., None)"
          suggestions={culetGrades}
          register={register}
          value={watch('culet') || ''}
          onChange={(value) => setValue('culet', value)}
          errors={errors}
        />
      </div>
    </div>
  );
}
