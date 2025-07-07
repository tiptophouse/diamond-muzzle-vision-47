
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { MobileFriendlySelect } from '@/components/ui/MobileFriendlySelect';
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
    <div className="space-y-6 p-4 border-t">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Detailed Grading</h3>
        <p className="text-sm text-gray-600">Professional grading details from certificate</p>
      </div>
      
      <div className="space-y-6">
        <MobileFriendlySelect
          id="fluorescence"
          label="Fluorescence"
          value={watch('fluorescence') || 'None'}
          onValueChange={(value) => setValue('fluorescence', value)}
          options={fluorescences}
          placeholder="Select fluorescence"
        />

        <MobileFriendlySelect
          id="polish"
          label="Polish"
          value={watch('polish') || 'Excellent'}
          onValueChange={(value) => setValue('polish', value)}
          options={polishGrades}
          placeholder="Select polish grade"
        />

        <MobileFriendlySelect
          id="symmetry"
          label="Symmetry"
          value={watch('symmetry') || 'Excellent'}
          onValueChange={(value) => setValue('symmetry', value)}
          options={symmetryGrades}
          placeholder="Select symmetry grade"
        />

        <MobileFriendlySelect
          id="gridle"
          label="Girdle"
          value={watch('gridle') || 'Medium'}
          onValueChange={(value) => setValue('gridle', value)}
          options={girdleTypes}
          placeholder="Select girdle type"
        />

        <MobileFriendlySelect
          id="culet"
          label="Culet"
          value={watch('culet') || 'None'}
          onValueChange={(value) => setValue('culet', value)}
          options={culetGrades}
          placeholder="Select culet grade"
        />
      </div>
    </div>
  );
}
