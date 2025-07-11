import React, { useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { MobilePicker } from '@/components/ui/MobilePicker';

interface MobilePhysicalMeasurementsProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

const gridleOptions = ['Thin', 'Medium', 'Thick', 'Very Thin', 'Very Thick', 'Extremely Thin', 'Extremely Thick'];

const culetOptions = ['None', 'Very Small', 'Small', 'Medium', 'Large', 'Very Large'];

export function MobilePhysicalMeasurements({ register, setValue, watch, errors }: MobilePhysicalMeasurementsProps) {
  const length = watch('length');
  const width = watch('width');

  // Auto-calculate ratio when length and width change
  useEffect(() => {
    if (length && width && length > 0 && width > 0) {
      const calculatedRatio = (length / width).toFixed(2);
      setValue('ratio', Number(calculatedRatio));
    }
  }, [length, width, setValue]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <DiamondInputField
          id="length"
          label="Length (mm)"
          type="number"
          step="0.01"
          placeholder="6.52"
          register={register}
          validation={{ 
            min: { value: 0.01, message: 'Must be > 0' }
          }}
          errors={errors}
        />

        <DiamondInputField
          id="width"
          label="Width (mm)"
          type="number"
          step="0.01"
          placeholder="6.48"
          register={register}
          validation={{ 
            min: { value: 0.01, message: 'Must be > 0' }
          }}
          errors={errors}
        />

        <DiamondInputField
          id="depth"
          label="Depth (mm)"
          type="number"
          step="0.01"
          placeholder="4.07"
          register={register}
          validation={{ 
            min: { value: 0.01, message: 'Must be > 0' }
          }}
          errors={errors}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DiamondInputField
          id="tablePercentage"
          label="Table %"
          type="number"
          step="0.1"
          placeholder="57.0"
          register={register}
          validation={{ 
            min: { value: 1, message: '1-100%' },
            max: { value: 100, message: '1-100%' }
          }}
          errors={errors}
        />

        <DiamondInputField
          id="depthPercentage"
          label="Depth %"
          type="number"
          step="0.1"
          placeholder="62.8"
          register={register}
          validation={{ 
            min: { value: 1, message: '1-100%' },
            max: { value: 100, message: '1-100%' }
          }}
          errors={errors}
        />
      </div>

      <DiamondInputField
        id="ratio"
        label="Length/Width Ratio"
        type="number"
        step="0.01"
        placeholder="Auto-calculated"
        register={register}
        errors={errors}
      />

      <div className="grid grid-cols-2 gap-3">
        <MobilePicker
          id="gridle"
          label="Girdle"
          value={watch('gridle') || 'Medium'}
          onValueChange={(value) => setValue('gridle', value)}
          options={gridleOptions}
        />

        <MobilePicker
          id="culet"
          label="Culet"
          value={watch('culet') || 'None'}
          onValueChange={(value) => setValue('culet', value)}
          options={culetOptions}
        />
      </div>
    </div>
  );
}