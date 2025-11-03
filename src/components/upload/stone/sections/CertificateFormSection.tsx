import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { NativeMobileSelector } from '@/components/ui/NativeMobileSelector';
import { labOptions } from '@/components/inventory/form/diamondFormConstants';

interface CertificateFormSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

/**
 * Certificate information section
 * Lab, certificate number, URL, comments
 */
export function CertificateFormSection({ register, setValue, watch, errors }: CertificateFormSectionProps) {
  return (
    <div className="space-y-4 px-3">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">תעודה</h3>
        <p className="text-xs text-muted-foreground">פרטי תעודת המעבדה</p>
      </div>
      
      <div className="space-y-3">
        <NativeMobileSelector
          id="lab"
          label="מעבדה"
          value={watch('lab') || 'GIA'}
          onValueChange={(value) => setValue('lab', value)}
          options={labOptions}
          columns={2}
        />

        <DiamondInputField
          id="certificateNumber"
          label="מספר תעודה"
          placeholder="הזינו מספר תעודה"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="certificateUrl"
          label="קישור לתעודה"
          placeholder="https://..."
          register={register}
          errors={errors}
        />

        <div className="space-y-2">
          <label htmlFor="certificateComment" className="text-sm font-medium text-foreground">
            הערות תעודה
          </label>
          <textarea
            id="certificateComment"
            {...register('certificateComment')}
            placeholder="הערות נוספות על התעודה..."
            className="w-full min-h-[80px] px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={1000}
          />
          {errors.certificateComment && (
            <p className="text-xs text-destructive">{errors.certificateComment.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
