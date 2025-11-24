import React from 'react';
import { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';

interface MeasurementsFormSectionProps {
  register: UseFormRegister<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

/**
 * Physical measurements section
 * Length, width, depth, ratio, table%, depth%
 */
export function MeasurementsFormSection({ register, watch, errors }: MeasurementsFormSectionProps) {
  return (
    <div className="space-y-4 px-3">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">מידות פיזיות</h3>
        <p className="text-xs text-muted-foreground">מידות מדויקות של היהלום</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <DiamondInputField
          id="length"
          label="אורך (מ״מ)"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="width"
          label="רוחב (מ״מ)"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="depth"
          label="עומק (מ״מ)"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="ratio"
          label="יחס *"
          type="number"
          step="0.01"
          placeholder="0.00"
          register={register}
          validation={{ required: 'יחס נדרש' }}
          errors={errors}
        />

        <DiamondInputField
          id="tablePercentage"
          label="שולחן %"
          type="number"
          step="0.1"
          placeholder="0.0"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="depthPercentage"
          label="עומק %"
          type="number"
          step="0.1"
          placeholder="0.0"
          register={register}
          errors={errors}
        />
      </div>
    </div>
  );
}
