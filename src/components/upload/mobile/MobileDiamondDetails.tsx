import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { MobileButtonSelector } from '@/components/ui/MobileButtonSelector';
import { MobilePicker } from '@/components/ui/MobilePicker';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades } from '@/components/inventory/form/diamondFormConstants';

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
    <div className="space-y-4">
      <DiamondInputField
        id="stockNumber"
        label="Stock Number"
        placeholder="Enter stock or certificate number"
        register={register}
        validation={{ required: 'Stock number is required' }}
        errors={errors}
      />

      <div className="grid grid-cols-1 gap-4">
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
          placeholder="e.g., 1.50"
          register={register}
          validation={{ 
            required: 'Carat is required',
            min: { value: 0.01, message: 'Carat must be greater than 0' }
          }}
          errors={errors}
        />

        <div className="grid grid-cols-2 gap-3">
          <MobileButtonSelector
            id="color"
            label="Color"
            value={watch('color') || 'G'}
            onValueChange={(value) => setValue('color', value)}
            options={colors}
            columns={4}
          />

          <MobileButtonSelector
            id="clarity"
            label="Clarity"
            value={watch('clarity') || 'VS1'}
            onValueChange={(value) => setValue('clarity', value)}
            options={clarities}
            columns={3}
          />
        </div>

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

        <div className="grid grid-cols-1 gap-3">
          <MobilePicker
            id="fluorescence"
            label="Fluorescence"
            value={watch('fluorescence') || 'None'}
            onValueChange={(value) => setValue('fluorescence', value)}
            options={fluorescences}
          />

          <div className="grid grid-cols-2 gap-3">
            <MobilePicker
              id="polish"
              label="Polish"
              value={watch('polish') || 'Excellent'}
              onValueChange={(value) => setValue('polish', value)}
              options={polishGrades}
            />

            <MobilePicker
              id="symmetry"
              label="Symmetry"
              value={watch('symmetry') || 'Excellent'}
              onValueChange={(value) => setValue('symmetry', value)}
              options={symmetryGrades}
            />
          </div>
        </div>
      </div>
    </div>
  );
}