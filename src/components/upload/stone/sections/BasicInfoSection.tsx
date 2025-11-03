import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { NativeMobileSelector } from '@/components/ui/NativeMobileSelector';
import { shapes, colors, clarities } from '@/components/inventory/form/diamondFormConstants';

interface BasicInfoSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

/**
 * Basic diamond information section
 * Stock number, shape, weight, color, clarity
 */
export function BasicInfoSection({ register, setValue, watch, errors }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4 px-3">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">פרטי יהלום בסיסיים</h3>
        <p className="text-xs text-muted-foreground">מלאו את המידע החיוני על היהלום</p>
      </div>
      
      <div className="space-y-3">
        <DiamondInputField
          id="stockNumber"
          label="מספר מלאי / תעודה"
          placeholder="הזינו מספר מלאי או תעודה"
          register={register}
          validation={{ required: 'מספר מלאי נדרש' }}
          errors={errors}
        />

        <NativeMobileSelector
          id="shape"
          label="צורה"
          value={watch('shape') || 'Round'}
          onValueChange={(value) => setValue('shape', value)}
          options={shapes}
          columns={3}
        />

        <DiamondInputField
          id="carat"
          label="משקל (קרט)"
          type="number"
          step="0.01"
          placeholder="הזינו משקל בקרט"
          register={register}
          validation={{ 
            required: 'משקל נדרש',
            min: { value: 0.01, message: 'משקל חייב להיות גדול מ-0' }
          }}
          errors={errors}
        />

        <NativeMobileSelector
          id="color"
          label="צבע"
          value={watch('color') || 'G'}
          onValueChange={(value) => setValue('color', value)}
          options={colors}
          columns={4}
        />

        <NativeMobileSelector
          id="clarity"
          label="בהירות"
          value={watch('clarity') || 'VS1'}
          onValueChange={(value) => setValue('clarity', value)}
          options={clarities}
          columns={3}
        />
      </div>
    </div>
  );
}
