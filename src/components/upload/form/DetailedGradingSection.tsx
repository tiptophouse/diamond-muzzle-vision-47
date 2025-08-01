
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { 
  fluorescences, 
  polishGrades, 
  symmetryGrades, 
  girdleTypes, 
  culetGrades 
} from '@/components/inventory/form/diamondFormConstants';
import { NativeMobileSelector } from '@/components/ui/NativeMobileSelector';

interface DetailedGradingSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function DetailedGradingSection({ register, setValue, watch, errors }: DetailedGradingSectionProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Detailed Grading</h3>
        <p className="text-sm text-muted-foreground">Professional grading details from certificate</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <NativeMobileSelector
          id="fluorescence"
          label="Fluorescence"
          value={watch('fluorescence') || 'None'}
          onValueChange={(value) => setValue('fluorescence', value)}
          options={fluorescences}
          columns={3}
        />

        <NativeMobileSelector
          id="polish"
          label="Polish"
          value={watch('polish') || 'Excellent'}
          onValueChange={(value) => setValue('polish', value)}
          options={polishGrades}
          columns={3}
        />

        <NativeMobileSelector
          id="symmetry"
          label="Symmetry"
          value={watch('symmetry') || 'Excellent'}
          onValueChange={(value) => setValue('symmetry', value)}
          options={symmetryGrades}
          columns={3}
        />

        <NativeMobileSelector
          id="gridle"
          label="Girdle"
          value={watch('gridle') || 'Medium'}
          onValueChange={(value) => setValue('gridle', value)}
          options={girdleTypes}
          columns={2}
        />

        <NativeMobileSelector
          id="culet"
          label="Culet"
          value={watch('culet') || 'None'}
          onValueChange={(value) => setValue('culet', value)}
          options={culetGrades}
          columns={3}
        />
      </div>
    </div>
  );
}
