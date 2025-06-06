
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondSelectField } from '@/components/inventory/form/DiamondSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { statuses } from '@/components/inventory/form/diamondFormConstants';

interface ManualInputSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function ManualInputSection({ register, setValue, watch, errors }: ManualInputSectionProps) {
  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Manual Input Required</h3>
      <p className="text-sm text-gray-600">These fields must be filled manually</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiamondInputField
          id="price"
          label="Price (USD) *"
          type="number"
          placeholder="Enter price in USD"
          register={register}
          validation={{ 
            required: 'Price is required',
            min: { value: 1, message: 'Price must be greater than 0' }
          }}
          errors={errors}
        />

        <DiamondSelectField
          id="status"
          label="Status"
          value={watch('status') || 'Available'}
          onValueChange={(value) => setValue('status', value)}
          options={statuses}
        />

        <div className="md:col-span-2">
          <DiamondInputField
            id="imageUrl"
            label="Stone Image URL (Optional)"
            placeholder="Enter image URL or upload separately"
            register={register}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}
