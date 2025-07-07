
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';

interface MobileMeasurementsSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileMeasurementsSection({ register, setValue, watch, errors }: MobileMeasurementsSectionProps) {
  const length = watch('length');
  const width = watch('width');

  // Auto-calculate ratio if both length and width are provided
  React.useEffect(() => {
    if (length && width && length > 0 && width > 0) {
      const calculatedRatio = Number((length / width).toFixed(2));
      setValue('ratio', calculatedRatio);
    }
  }, [length, width, setValue]);

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="border-l-4 border-green-400 pl-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Physical Measurements</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Precise measurements of the diamond</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
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
            className="text-base"
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
            className="text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
            className="text-base"
          />

          <DiamondInputField
            id="ratio"
            label="L/W Ratio"
            type="number"
            step="0.01"
            placeholder="Auto-calculated"
            register={register}
            errors={errors}
            className="text-base"
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
              min: { value: 1, message: 'Table % must be between 1-100' },
              max: { value: 100, message: 'Table % must be between 1-100' }
            }}
            errors={errors}
            className="text-base"
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
            className="text-base"
          />
        </div>
      </div>
    </div>
  );
}
