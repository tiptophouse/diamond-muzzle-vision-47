
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { ModernSelectField } from '@/components/inventory/form/ModernSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades } from '@/components/inventory/form/diamondFormConstants';

interface MobileDiamondDetailsSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileDiamondDetailsSection({ register, setValue, watch, errors }: MobileDiamondDetailsSectionProps) {
  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  return (
    <div className="space-y-4">
      <div className="border-l-4 border-diamond-400 pl-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Diamond Details</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Essential diamond characteristics
        </p>
      </div>
      
      <div className="space-y-4">
        <DiamondInputField
          id="stockNumber"
          label="Stock Number / Certificate Number *"
          placeholder="Enter stock or certificate number"
          register={register}
          validation={{ required: 'Stock number is required' }}
          errors={errors}
          className="text-base" // Better for mobile
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModernSelectField
            id="shape"
            label="Shape"
            value={watch('shape') || 'Round'}
            onValueChange={(value) => setValue('shape', value)}
            options={shapes}
          />

          <DiamondInputField
            id="carat"
            label="Carat Weight *"
            type="number"
            step="0.01"
            placeholder="Enter carat weight"
            register={register}
            validation={{ 
              required: 'Carat is required',
              min: { value: 0.01, message: 'Carat must be greater than 0' }
            }}
            errors={errors}
            className="text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ModernSelectField
            id="color"
            label="Color Grade"
            value={watch('color') || 'G'}
            onValueChange={(value) => setValue('color', value)}
            options={colors}
          />

          <ModernSelectField
            id="clarity"
            label="Clarity Grade"
            value={watch('clarity') || 'VS1'}
            onValueChange={(value) => setValue('clarity', value)}
            options={clarities}
          />
        </div>

        {showCutField && (
          <ModernSelectField
            id="cut"
            label="Cut Grade"
            value={watch('cut') || 'Excellent'}
            onValueChange={(value) => setValue('cut', value)}
            options={cuts}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        </div>
      </div>
    </div>
  );
}
