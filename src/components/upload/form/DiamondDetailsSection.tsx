
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { AutocompleteInputField } from '@/components/inventory/form/AutocompleteInputField';
import { ModernSelectField } from '@/components/inventory/form/ModernSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades } from '@/components/inventory/form/diamondFormConstants';

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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Diamond Details</h3>
      <p className="text-sm text-gray-600">These fields can be auto-filled by scanning a GIA certificate</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiamondInputField
          id="stockNumber"
          label="Stock Number / Certificate Number"
          placeholder="Enter stock or certificate number"
          register={register}
          validation={{ required: 'Stock number is required' }}
          errors={errors}
        />

        <ModernSelectField
          id="shape"
          label="Shape"
          value={watch('shape') || 'Round'}
          onValueChange={(value) => setValue('shape', value)}
          options={shapes}
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

        {showCutField && (
          <AutocompleteInputField
            id="cut"
            label="Cut Grade"
            placeholder="Type cut grade (e.g., Excellent)"
            suggestions={cuts}
            register={register}
            value={watch('cut') || ''}
            onChange={(value) => setValue('cut', value)}
            errors={errors}
          />
        )}

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
      </div>
    </div>
  );
}
