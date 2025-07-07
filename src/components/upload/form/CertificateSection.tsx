
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { MobileFriendlySelect } from '@/components/ui/MobileFriendlySelect';
import { DiamondFormData } from '@/components/inventory/form/types';
import { labOptionsList } from '@/components/inventory/form/optionHelpers';

interface CertificateSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function CertificateSection({ register, setValue, watch, errors }: CertificateSectionProps) {
  return (
    <div className="space-y-6 p-4 border-t">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Certificate Information</h3>
        <p className="text-sm text-gray-600">GIA or other grading laboratory details</p>
      </div>
      
      <div className="space-y-6">
        <DiamondInputField
          id="certificateNumber"
          label="Certificate Number"
          placeholder="e.g., 2141438171"
          register={register}
          errors={errors}
        />

        <MobileFriendlySelect
          id="lab"
          label="Grading Laboratory"
          value={watch('lab') || 'GIA'}
          onValueChange={(value) => setValue('lab', value)}
          options={labOptionsList}
          placeholder="Select laboratory"
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
