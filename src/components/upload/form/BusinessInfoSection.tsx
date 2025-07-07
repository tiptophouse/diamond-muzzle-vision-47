
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
  const carat = watch('carat');
  const price = watch('price');

  // Auto-calculate price per carat
  React.useEffect(() => {
    if (carat && price && carat > 0) {
      const pricePerCarat = Math.round(price / carat);
      setValue('pricePerCarat', pricePerCarat);
    }
  }, [carat, price, setValue]);

  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
      <p className="text-sm text-gray-600">Pricing and inventory management details</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiamondInputField
          id="price"
          label="Total Price (USD) *"
          type="number"
          placeholder="Enter total price"
          register={register}
          validation={{ 
            required: 'Price is required',
            min: { value: 1, message: 'Price must be greater than 0' }
          }}
          errors={errors}
        />

        <DiamondInputField
          id="pricePerCarat"
          label="Price Per Carat (USD)"
          type="number"
          placeholder="Auto-calculated from total price"
          register={register}
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

        <DiamondSelectField
          id="status"
          label="Inventory Status"
          value={watch('status') || 'Available'}
          onValueChange={(value) => setValue('status', value)}
          options={statuses}
        />

        <div className="md:col-span-2 flex items-center space-x-2">
          <Switch
            id="storeVisible"
            checked={watch('storeVisible') || false}
            onCheckedChange={(checked) => setValue('storeVisible', checked)}
          />
          <Label htmlFor="storeVisible">Make visible in public store</Label>
        </div>
      </div>
    </div>
  );
}
