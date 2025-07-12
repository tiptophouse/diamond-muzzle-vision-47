
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades } from '@/components/inventory/form/diamondFormConstants';
import { NativeMobileSelector } from '@/components/ui/NativeMobileSelector';
import { NativeWheelPicker } from '@/components/ui/NativeWheelPicker';

interface DiamondDetailsSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function DiamondDetailsSection({ register, setValue, watch, errors }: DiamondDetailsSectionProps) {
  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  return (
    <div className="space-y-6 pb-safe">
      <div className="space-y-2 px-4">
        <h3 className="text-xl font-semibold text-foreground">Diamond Details</h3>
        <p className="text-sm text-muted-foreground">Fill in the diamond information</p>
      </div>
      
      <div className="space-y-6 px-4">
        <DiamondInputField
          id="stockNumber"
          label="Stock Number / Certificate Number"
          placeholder="Enter stock or certificate number"
          register={register}
          validation={{ required: 'Stock number is required' }}
          errors={errors}
        />

        {/* Shape - Always first */}
        <NativeMobileSelector
          id="shape"
          label="Shape"
          value={watch('shape') || 'Round'}
          onValueChange={(value) => setValue('shape', value)}
          options={shapes}
          columns={3}
        />

        {/* Weight */}
        <DiamondInputField
          id="carat"
          label="Weight (Carat)"
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

        {/* Color */}
        <NativeMobileSelector
          id="color"
          label="Color"
          value={watch('color') || 'G'}
          onValueChange={(value) => setValue('color', value)}
          options={colors}
          columns={4}
        />

        {/* Clarity */}
        <NativeMobileSelector
          id="clarity"
          label="Clarity"
          value={watch('clarity') || 'VS1'}
          onValueChange={(value) => setValue('clarity', value)}
          options={clarities}
          columns={3}
        />

        {/* Cut - Only for Round diamonds */}
        {showCutField && (
          <NativeMobileSelector
            id="cut"
            label="Cut"
            value={watch('cut') || 'Excellent'}
            onValueChange={(value) => setValue('cut', value)}
            options={cuts}
            columns={2}
          />
        )}

        {/* Polish - For all shapes */}
        <NativeWheelPicker
          id="polish"
          label="Polish"
          value={watch('polish') || 'Excellent'}
          onValueChange={(value) => setValue('polish', value)}
          options={polishGrades}
        />

        {/* Symmetry - For all shapes */}
        <NativeWheelPicker
          id="symmetry"
          label="Symmetry"
          value={watch('symmetry') || 'Excellent'}
          onValueChange={(value) => setValue('symmetry', value)}
          options={symmetryGrades}
        />

        {/* Fluorescence - For all shapes */}
        <NativeWheelPicker
          id="fluorescence"
          label="Fluorescence"
          value={watch('fluorescence') || 'None'}
          onValueChange={(value) => setValue('fluorescence', value)}
          options={fluorescences}
        />
      </div>
    </div>
  );
}
