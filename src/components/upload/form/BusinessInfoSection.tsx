
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondSelectField } from '@/components/inventory/form/DiamondSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { statuses } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BusinessInfoSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function BusinessInfoSection({ register, setValue, watch, errors }: BusinessInfoSectionProps) {
  const weight = watch('weight');
  const pricePerCarat = watch('price_per_carat');

  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
      <p className="text-sm text-gray-600">Pricing and inventory management details</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiamondInputField
          id="price_per_carat"
          label="Price Per Carat (USD) *"
          type="number"
          placeholder="Enter price per carat"
          register={register}
          validation={{ 
            required: 'Price per carat is required',
            min: { value: 1, message: 'Price per carat must be greater than 0' }
          }}
          errors={errors}
        />

        <DiamondInputField
          id="rapnet"
          label="RapNet Percentage"
          type="number"
          placeholder="e.g., -15 (for 15% below RapNet)"
          register={register}
          errors={errors}
        />
      </div>
    </div>
  );
}
