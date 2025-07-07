
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
    <div className="space-y-6">      
      <div className="space-y-4">
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

        <DiamondInputField
          id="certificateUrl"
          label="Certificate URL"
          placeholder="Link to online certificate verification"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="certificateComment"
          label="Certificate Comments"
          placeholder="Additional comments or inscriptions"
          register={register}
          errors={errors}
        />
      </div>
    </div>
  );
}
