import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';

interface MobilePhysicalMeasurementsProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobilePhysicalMeasurements({ register, setValue, watch, errors }: MobilePhysicalMeasurementsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <DiamondInputField
          id="length"
          label="Length (mm)"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="width"
          label="Width (mm)"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          errors={errors}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DiamondInputField
          id="depth"
          label="Depth (mm)"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="ratio"
          label="L/W Ratio"
          type="number"
          step="0.01"
          placeholder="0.00"
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
          placeholder="0.0"
          register={register}
          validation={{
            min: { value: 0, message: 'Must be greater than 0' },
            max: { value: 100, message: 'Must be less than 100' }
          }}
          errors={errors}
        />

        <DiamondInputField
          id="depthPercentage"
          label="Depth %"
          type="number"
          step="0.1"
          placeholder="0.0"
          register={register}
          validation={{
            min: { value: 0, message: 'Must be greater than 0' },
            max: { value: 100, message: 'Must be less than 100' }
          }}
          errors={errors}
        />
      </div>
    </div>
  );
}