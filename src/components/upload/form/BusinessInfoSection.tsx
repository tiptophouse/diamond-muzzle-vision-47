
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { statuses } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NativeMobileSelector } from '@/components/ui/NativeMobileSelector';

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
    <div className="space-y-6 border-t pt-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
        <p className="text-sm text-muted-foreground">Pricing and inventory management details</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
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

        <NativeMobileSelector
          id="status"
          label="Inventory Status"
          value={watch('status') || 'Available'}
          onValueChange={(value) => setValue('status', value)}
          options={statuses}
          columns={2}
        />

        <div className="flex items-center space-x-3 p-4 bg-accent/10 rounded-lg">
          <Switch
            id="storeVisible"
            checked={watch('storeVisible') || false}
            onCheckedChange={(checked) => setValue('storeVisible', checked)}
          />
          <Label htmlFor="storeVisible" className="text-base font-medium">
            Make visible in public store
          </Label>
        </div>
      </div>
    </div>
  );
}
