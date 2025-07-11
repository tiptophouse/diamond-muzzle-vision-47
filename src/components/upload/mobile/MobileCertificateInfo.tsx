import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { labOptions, girdleTypes, culetGrades } from '@/components/inventory/form/diamondFormConstants';
import { MobileButtonSelector } from '@/components/ui/MobileButtonSelector';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MobileCertificateInfoProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileCertificateInfo({ register, setValue, watch, errors }: MobileCertificateInfoProps) {
  return (
    <div className="space-y-6">
      <DiamondInputField
        id="certificateNumber"
        label="Certificate Number"
        placeholder="Enter certificate number"
        register={register}
        errors={errors}
      />

      <MobileButtonSelector
        id="lab"
        label="Certification Lab"
        value={watch('lab') || 'GIA'}
        onValueChange={(value) => setValue('lab', value)}
        options={labOptions}
        columns={3}
      />

      <DiamondInputField
        id="certificateUrl"
        label="Certificate URL"
        placeholder="Enter certificate image URL"
        register={register}
        errors={errors}
      />

      <MobileButtonSelector
        id="gridle"
        label="Girdle"
        value={watch('gridle') || 'Medium'}
        onValueChange={(value) => setValue('gridle', value)}
        options={girdleTypes}
        columns={2}
      />

      <MobileButtonSelector
        id="culet"
        label="Culet"
        value={watch('culet') || 'None'}
        onValueChange={(value) => setValue('culet', value)}
        options={culetGrades}
        columns={2}
      />

      <div className="space-y-2">
        <Label htmlFor="certificateComment" className="text-sm font-medium">
          Certificate Comments
        </Label>
        <Textarea
          id="certificateComment"
          placeholder="Additional certificate notes or comments"
          className="min-h-[80px] text-base"
          {...register('certificateComment')}
        />
        {errors.certificateComment && (
          <p className="text-sm text-destructive">{errors.certificateComment.message}</p>
        )}
      </div>
    </div>
  );
}