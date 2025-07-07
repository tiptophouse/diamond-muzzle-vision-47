
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { labOptions } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';

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

        <div>
          <Label htmlFor="lab">Grading Laboratory</Label>
          <select
            id="lab"
            {...register('lab')}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {labOptions.map((lab) => (
              <option key={lab} value={lab}>
                {lab}
              </option>
            ))}
          </select>
        </div>

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
