import React, { useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { statuses } from '@/components/inventory/form/diamondFormConstants';
import { MobileButtonSelector } from '@/components/ui/MobileButtonSelector';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface MobileBusinessInfoProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileBusinessInfo({ register, setValue, watch, errors }: MobileBusinessInfoProps) {
  const pricePerCarat = watch('pricePerCarat');
  const carat = watch('carat');
  const price = watch('price');

  // Auto-calculate total price when price per carat or carat changes
  useEffect(() => {
    if (pricePerCarat && carat && pricePerCarat > 0 && carat > 0) {
      const totalPrice = pricePerCarat * carat;
      setValue('price', totalPrice);
    }
  }, [pricePerCarat, carat, setValue]);

  return (
    <div className="space-y-6">
      <DiamondInputField
        id="pricePerCarat"
        label="Price Per Carat ($)"
        type="number"
        step="0.01"
        placeholder="Enter price per carat"
        register={register}
        validation={{
          min: { value: 0, message: 'Price must be greater than 0' }
        }}
        errors={errors}
      />

      {/* Auto-calculated total price display */}
      {pricePerCarat && carat && (
        <Card className="bg-accent/50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calculator className="h-4 w-4" />
              Auto-calculated Total Price
            </div>
            <div className="text-2xl font-bold text-primary">
              ${(pricePerCarat * carat).toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              {carat} ct × ${pricePerCarat.toLocaleString()} per ct
            </div>
          </CardContent>
        </Card>
      )}

      <DiamondInputField
        id="price"
        label="Total Price ($)"
        type="number"
        step="0.01"
        placeholder="Total price (auto-calculated)"
        register={register}
        validation={{
          required: 'Price is required',
          min: { value: 0, message: 'Price must be greater than 0' }
        }}
        errors={errors}
      />

      <DiamondInputField
        id="rapnet"
        label="Rapnet Price ($)"
        type="number"
        step="0.01"
        placeholder="Enter Rapnet pricing"
        register={register}
        errors={errors}
      />

      <MobileButtonSelector
        id="status"
        label="Inventory Status"
        value={watch('status') || 'Available'}
        onValueChange={(value) => setValue('status', value)}
        options={statuses}
        columns={2}
      />
    </div>
  );
}