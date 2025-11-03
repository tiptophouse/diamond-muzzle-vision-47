import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PricingSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

/**
 * Business and pricing section
 * Price, price per carat, rapnet, status, store visibility
 */
export function PricingSection({ register, setValue, watch, errors }: PricingSectionProps) {
  const storeVisible = watch('storeVisible') ?? true;

  return (
    <div className="space-y-4 px-3">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">מידע עסקי</h3>
        <p className="text-xs text-muted-foreground">מחירים וסטטוס</p>
      </div>
      
      <div className="space-y-3">
        <DiamondInputField
          id="price"
          label="מחיר ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          validation={{ 
            required: 'מחיר נדרש',
            min: { value: 0, message: 'מחיר לא יכול להיות שלילי' }
          }}
          errors={errors}
        />

        <DiamondInputField
          id="pricePerCarat"
          label="מחיר לקרט ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="rapnet"
          label="Rapnet (%)"
          type="number"
          step="0.1"
          placeholder="0.0"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="status"
          label="סטטוס"
          placeholder="Available / Reserved / Sold"
          register={register}
          validation={{ required: 'סטטוס נדרש' }}
          errors={errors}
        />

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <Label htmlFor="storeVisible" className="text-sm font-medium text-foreground">
            הצג בחנות
          </Label>
          <Switch
            id="storeVisible"
            checked={storeVisible}
            onCheckedChange={(checked) => setValue('storeVisible', checked)}
          />
        </div>
      </div>
    </div>
  );
}
