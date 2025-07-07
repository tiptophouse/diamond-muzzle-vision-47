
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { ModernSelectField } from '@/components/inventory/form/ModernSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';

interface ManualInputSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function ManualInputSection({ register, setValue, watch, errors }: ManualInputSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
      <p className="text-sm text-gray-600">Enter diamond details manually</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiamondInputField
          id="price_per_carat"
          label="Price per Carat ($)"
          type="number"
          placeholder="Enter price per carat"
          register={register}
          validation={{ 
            required: 'Price per carat is required',
            min: { value: 0.01, message: 'Price must be greater than 0' }
          }}
          errors={errors}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diamond Status
          </label>
          <select
            {...register('picture')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>
    </div>
  );
}
