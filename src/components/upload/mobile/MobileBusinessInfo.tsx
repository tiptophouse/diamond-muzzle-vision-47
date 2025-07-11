import React, { useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';

interface MobileBusinessInfoProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileBusinessInfo({ register, setValue, watch, errors }: MobileBusinessInfoProps) {
  const pricePerCarat = watch('pricePerCarat');
  const carat = watch('carat');

  // Auto-calculate total price when price per carat or carat changes
  useEffect(() => {
    if (pricePerCarat && carat && pricePerCarat > 0 && carat > 0) {
      const totalPrice = pricePerCarat * carat;
      setValue('price', totalPrice);
    }
  }, [pricePerCarat, carat, setValue]);

  return (
    <div className="space-y-4">
      <DiamondInputField
        id="pricePerCarat"
        label="Price per Carat ($)"
        type="number"
        step="0.01"
        placeholder="Enter price per carat"
        register={register}
        validation={{ 
          min: { value: 0.01, message: 'Price must be greater than 0' }
        }}
        errors={errors}
      />

      <DiamondInputField
        id="price"
        label="Total Price ($)"
        type="number"
        step="0.01"
        placeholder="Auto-calculated"
        register={register}
        validation={{ 
          min: { value: 0.01, message: 'Price must be greater than 0' }
        }}
        errors={errors}
      />

      <DiamondInputField
        id="rapnet"
        label="Rapnet Price ($)"
        type="number"
        step="0.01"
        placeholder="Market reference price"
        register={register}
        errors={errors}
      />

      <div className="bg-muted/30 p-3 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Total price is auto-calculated from price per carat × carat weight
        </p>
      </div>
    </div>
  );
}