
import React from 'react';
import { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';

interface MeasurementsSectionProps {
  register: UseFormRegister<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MeasurementsSection({ register, watch, errors }: MeasurementsSectionProps) {
  const length = watch('length');
  const width = watch('width');

  // Auto-calculate ratio if both length and width are provided
  React.useEffect(() => {
    if (length && width && length > 0 && width > 0) {
      const calculatedRatio = (length / width).toFixed(2);
      // You might want to set this value using setValue if needed
    }
  }, [length, width]);

  return (
    <div className="space-y-6 pt-8 pb-safe">
      <div className="space-y-2 px-4">
        <h3 className="text-xl font-semibold text-foreground">Measurements</h3>
        <p className="text-sm text-muted-foreground">Precise diamond measurements</p>
      </div>
      
      <div className="space-y-4 px-4">
        <div className="grid grid-cols-2 gap-4">
          <DiamondInputField
            id="length"
            label="Length (mm)"
            type="number"
            step="0.01"
            placeholder="6.52"
            register={register}
            validation={{ 
              min: { value: 0.01, message: 'Length must be greater than 0' }
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
              min: { value: 0.01, message: 'Width must be greater than 0' }
            }}
            errors={errors}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DiamondInputField
            id="depth"
            label="Depth (mm)"
            type="number"
            step="0.01"
            placeholder="4.07"
            register={register}
            validation={{ 
              min: { value: 0.01, message: 'Depth must be greater than 0' }
            }}
            errors={errors}
          />

          <DiamondInputField
            id="ratio"
            label="L/W Ratio"
            type="number"
            step="0.01"
            placeholder="1.01"
            register={register}
            errors={errors}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DiamondInputField
            id="tablePercentage"
            label="Table %"
            type="number"
            step="0.1"
            placeholder="57.0"
            register={register}
            validation={{ 
              min: { value: 1, message: 'Table % must be between 1-100' },
              max: { value: 100, message: 'Table % must be between 1-100' }
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
              min: { value: 1, message: 'Depth % must be between 1-100' },
              max: { value: 100, message: 'Depth % must be between 1-100' }
            }}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}
