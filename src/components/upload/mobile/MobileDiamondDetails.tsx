import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades } from '@/components/inventory/form/diamondFormConstants';
import { MobileButtonSelector } from '@/components/ui/MobileButtonSelector';


interface MobileDiamondDetailsProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileDiamondDetails({ register, setValue, watch, errors }: MobileDiamondDetailsProps) {
  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  return (
    <div className="space-y-6">
      <DiamondInputField
        id="stockNumber"
        label="Stock Number"
        placeholder="Enter stock or certificate number"
        register={register}
        validation={{ required: 'Stock number is required' }}
        errors={errors}
      />

      <MobileButtonSelector
        id="shape"
        label="Shape"
        value={watch('shape') || 'Round'}
        onValueChange={(value) => setValue('shape', value)}
        options={shapes}
        columns={3}
      />

      <DiamondInputField
        id="carat"
        label="Carat Weight"
        type="number"
        step="0.01"
        placeholder="Enter carat weight"
        register={register}
        validation={{ 
          required: 'Carat is required',
          min: { value: 0.01, message: 'Carat must be greater than 0' }
        }}
        errors={errors}
      />

      <MobileButtonSelector
        id="color"
        label="Color Grade"
        value={watch('color') || 'G'}
        onValueChange={(value) => setValue('color', value)}
        options={colors}
        columns={4}
      />

      <MobileButtonSelector
        id="clarity"
        label="Clarity Grade"
        value={watch('clarity') || 'VS1'}
        onValueChange={(value) => setValue('clarity', value)}
        options={clarities}
        columns={3}
      />

      {showCutField && (
        <MobileButtonSelector
          id="cut"
          label="Cut Grade"
          value={watch('cut') || 'Excellent'}
          onValueChange={(value) => setValue('cut', value)}
          options={cuts}
          columns={2}
        />
      )}

      <MobileButtonSelector
        id="fluorescence"
        label="Fluorescence"
        value={watch('fluorescence') || 'None'}
        onValueChange={(value) => setValue('fluorescence', value)}
        options={fluorescences}
        columns={2}
      />

      <MobileButtonSelector
        id="polish"
        label="Polish"
        value={watch('polish') || 'Excellent'}
        onValueChange={(value) => setValue('polish', value)}
        options={polishGrades}
        columns={2}
      />

      <MobileButtonSelector
        id="symmetry"
        label="Symmetry"
        value={watch('symmetry') || 'Excellent'}
        onValueChange={(value) => setValue('symmetry', value)}
        options={symmetryGrades}
        columns={2}
      />
    </div>
  );
}