
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { statuses } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NativeMobileSelector } from '@/components/ui/NativeMobileSelector';
import { roundToInteger, formatPricePerCarat } from '@/utils/numberUtils';

interface BusinessInfoSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function BusinessInfoSection({ register, setValue, watch, errors }: BusinessInfoSectionProps) {
  const carat = watch('carat');
  const price = watch('price');
  const [pricingMode, setPricingMode] = React.useState<'total' | 'perCarat' | 'discount'>('total');

  // Auto-calculate price per carat with proper integer rounding (only in total price mode)
  React.useEffect(() => {
    if (pricingMode === 'total' && carat && price && carat > 0) {
      const pricePerCarat = formatPricePerCarat(price, carat);
      setValue('pricePerCarat', pricePerCarat);
    }
  }, [carat, price, setValue, pricingMode]);

  // Clear other fields when switching modes
  React.useEffect(() => {
    if (pricingMode === 'total') {
      setValue('pricePerCarat', undefined);
      setValue('rapnet', undefined);
    } else if (pricingMode === 'perCarat') {
      setValue('price', undefined);
      setValue('rapnet', undefined);
    } else if (pricingMode === 'discount') {
      setValue('price', undefined);
      setValue('pricePerCarat', undefined);
    }
  }, [pricingMode, setValue]);

  // Ensure price field always shows as integer
  React.useEffect(() => {
    if (price) {
      const roundedPrice = roundToInteger(price);
      if (roundedPrice !== price) {
        setValue('price', roundedPrice);
      }
    }
  }, [price, setValue]);

  return (
    <div className="space-y-6 border-t pt-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
        <p className="text-sm text-muted-foreground">Pricing and inventory management details</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Pricing Mode Selector */}
        <div className="space-y-3">
          <Label className="text-base font-medium">How do you want to enter the price?</Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPricingMode('total')}
              className={`p-3 rounded-lg border-2 transition-all ${
                pricingMode === 'total' 
                  ? 'border-primary bg-primary/10 text-primary font-semibold' 
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              Total Price
            </button>
            <button
              type="button"
              onClick={() => setPricingMode('perCarat')}
              className={`p-3 rounded-lg border-2 transition-all ${
                pricingMode === 'perCarat' 
                  ? 'border-primary bg-primary/10 text-primary font-semibold' 
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              Price/Carat
            </button>
            <button
              type="button"
              onClick={() => setPricingMode('discount')}
              className={`p-3 rounded-lg border-2 transition-all ${
                pricingMode === 'discount' 
                  ? 'border-primary bg-primary/10 text-primary font-semibold' 
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              Discount %
            </button>
          </div>
        </div>

        {/* Conditional Fields Based on Mode */}
        {pricingMode === 'total' && (
          <>
            <DiamondInputField
              id="price"
              label="Total Price (USD) *"
              type="number"
              placeholder="Enter total price (e.g., 5000)"
              register={register}
              validation={{ 
                required: 'Total price is required',
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
          </>
        )}

        {pricingMode === 'perCarat' && (
          <DiamondInputField
            id="pricePerCarat"
            label="Price Per Carat (USD) *"
            type="number"
            placeholder="Enter price per carat (e.g., 8000)"
            register={register}
            validation={{ 
              required: 'Price per carat is required',
              min: { value: 1, message: 'Price per carat must be greater than 0' }
            }}
            errors={errors}
          />
        )}

        {pricingMode === 'discount' && (
          <DiamondInputField
            id="rapnet"
            label="Discount Percentage *"
            type="number"
            placeholder="Enter discount (e.g., 40 for 40% below, or -15 for 15% below)"
            register={register}
            validation={{ 
              required: 'Discount percentage is required'
            }}
            errors={errors}
          />
        )}

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
