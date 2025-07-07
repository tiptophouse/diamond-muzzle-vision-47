
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

interface MobileDetailedGradingSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileDetailedGradingSection({ register, setValue, watch, errors }: MobileDetailedGradingSectionProps) {
  return (
    <div className="space-y-4 border-t pt-6">
      <div className="border-l-4 border-purple-400 pl-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Detailed Grading</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Professional grading details from certificate</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
    </div>
  );
}
