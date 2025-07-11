import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { MobilePicker } from '@/components/ui/MobilePicker';
import { labOptions } from '@/components/inventory/form/diamondFormConstants';

interface MobileCertificateInfoProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileCertificateInfo({ register, setValue, watch, errors }: MobileCertificateInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <DiamondInputField
          id="certificateNumber"
          label="Certificate Number"
          placeholder="e.g., 2141438171"
          register={register}
          errors={errors}
        />

        <MobilePicker
          id="lab"
          label="Grading Laboratory"
          value={watch('lab') || 'GIA'}
          onValueChange={(value) => setValue('lab', value)}
          options={labOptions}
          placeholder="Select laboratory"
        />

        <DiamondInputField
          id="certificateUrl"
          label="Certificate URL"
          placeholder="Link to online certificate"
          register={register}
          errors={errors}
        />

        <DiamondInputField
          id="certificateComment"
          label="Certificate Comments"
          placeholder="Additional notes or inscriptions"
          register={register}
          errors={errors}
        />
      </div>
    </div>
  );
}