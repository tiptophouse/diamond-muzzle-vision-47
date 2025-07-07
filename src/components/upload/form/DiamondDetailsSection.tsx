
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { MobileFriendlySelect } from '@/components/ui/MobileFriendlySelect';
import { DiamondFormData } from '@/components/inventory/form/types';
import { 
  shapeOptions, 
  colorOptions, 
  clarityOptions, 
  cutOptions, 
  fluorescenceOptions, 
  polishOptions, 
  symmetryOptions 
} from '@/components/inventory/form/optionHelpers';

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
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Diamond Details</h3>
        <p className="text-sm text-gray-600">Tap to scan GIA certificate or fill manually</p>
      </div>
      
      <div className="space-y-6">
        <DiamondInputField
          id="stockNumber"
          label="Stock / Certificate Number"
          placeholder="Enter stock or certificate number"
          register={register}
          validation={{ required: 'Stock number is required' }}
          errors={errors}
        />

        <MobileFriendlySelect
          id="shape"
          label="Shape"
          value={watch('shape') || 'Round'}
          onValueChange={(value) => setValue('shape', value)}
          options={shapeOptions}
          placeholder="Select diamond shape"
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

        <MobileFriendlySelect
          id="color"
          label="Color Grade"
          value={watch('color') || 'G'}
          onValueChange={(value) => setValue('color', value)}
          options={colorOptions}
          placeholder="Select color grade"
        />

        <MobileFriendlySelect
          id="clarity"
          label="Clarity Grade"
          value={watch('clarity') || 'VS1'}
          onValueChange={(value) => setValue('clarity', value)}
          options={clarityOptions}
          placeholder="Select clarity grade"
        />

        {showCutField && (
          <MobileFriendlySelect
            id="cut"
            label="Cut Grade"
            value={watch('cut') || 'Excellent'}
            onValueChange={(value) => setValue('cut', value)}
            options={cutOptions}
            placeholder="Select cut grade"
          />
        )}

        <MobileFriendlySelect
          id="fluorescence"
          label="Fluorescence"
          value={watch('fluorescence') || 'None'}
          onValueChange={(value) => setValue('fluorescence', value)}
          options={fluorescenceOptions}
          placeholder="Select fluorescence"
        />

        <MobileFriendlySelect
          id="polish"
          label="Polish"
          value={watch('polish') || 'Excellent'}
          onValueChange={(value) => setValue('polish', value)}
          options={polishOptions}
          placeholder="Select polish grade"
        />

        <MobileFriendlySelect
          id="symmetry"
          label="Symmetry"
          value={watch('symmetry') || 'Excellent'}
          onValueChange={(value) => setValue('symmetry', value)}
          options={symmetryOptions}
          placeholder="Select symmetry grade"
        />
      </div>
    </div>
  );
}
