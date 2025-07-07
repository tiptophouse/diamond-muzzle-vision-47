
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { ModernSelectField } from '@/components/inventory/form/ModernSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { labOptions } from '@/components/inventory/form/diamondFormConstants';

interface CertificateSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function CertificateSection({ register, setValue, watch, errors }: CertificateSectionProps) {
  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Certificate Information</h3>
      <p className="text-sm text-gray-600">GIA or other grading laboratory certificate details</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiamondInputField
          id="certificateNumber"
          label="Certificate Number"
          placeholder="e.g., 2141438171"
          register={register}
          errors={errors}
        />

        <ModernSelectField
          id="lab"
          label="Grading Laboratory"
          value={watch('lab') || 'GIA'}
          onValueChange={(value) => setValue('lab', value)}
          options={labOptions}
        />

        <div className="md:col-span-2">
          <DiamondInputField
            id="certificateUrl"
            label="Certificate URL"
            placeholder="Link to online certificate verification"
            register={register}
            errors={errors}
          />
        </div>

        <div className="md:col-span-2">
          <DiamondInputField
            id="certificateComment"
            label="Certificate Comments"
            placeholder="Additional comments or inscriptions"
            register={register}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}
