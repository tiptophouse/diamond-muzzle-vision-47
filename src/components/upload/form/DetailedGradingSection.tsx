
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { ModernSelectField } from '@/components/inventory/form/ModernSelectField';
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
    <div className="space-y-6">      
      <div className="space-y-4">
        <ModernSelectField
          id="fluorescence"
          label="Fluorescence"
          value={watch('fluorescence') || 'None'}
          onValueChange={(value) => setValue('fluorescence', value)}
          options={fluorescences}
        />

        <ModernSelectField
          id="polish"
          label="Polish"
          value={watch('polish') || 'Excellent'}
          onValueChange={(value) => setValue('polish', value)}
          options={polishGrades}
        />

        <ModernSelectField
          id="symmetry"
          label="Symmetry"
          value={watch('symmetry') || 'Excellent'}
          onValueChange={(value) => setValue('symmetry', value)}
          options={symmetryGrades}
        />

        <ModernSelectField
          id="gridle"
          label="Girdle"
          value={watch('gridle') || 'Medium'}
          onValueChange={(value) => setValue('gridle', value)}
          options={girdleTypes}
        />

        <ModernSelectField
          id="culet"
          label="Culet"
          value={watch('culet') || 'None'}
          onValueChange={(value) => setValue('culet', value)}
          options={culetGrades}
        />
      </div>
    </div>
  );
}
