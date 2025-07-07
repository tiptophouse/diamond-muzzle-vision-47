
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { labOptions } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CertificateSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function CertificateSection({ register, setValue, watch, errors }: CertificateSectionProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Certificate Information</h3>
        <p className="text-sm text-muted-foreground">GIA or other grading laboratory certificate details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiamondInputField
          id="certificateNumber"
          label="Certificate Number"
          placeholder="e.g., 2141438171"
          register={register}
          errors={errors}
        />

        <div className="space-y-2">
          <Label htmlFor="lab" className="text-sm font-medium text-foreground">
            Grading Laboratory
          </Label>
          <Select value={watch('lab') || 'GIA'} onValueChange={(value) => setValue('lab', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select laboratory" />
            </SelectTrigger>
            <SelectContent>
              {labOptions.map((lab) => (
                <SelectItem key={lab} value={lab}>
                  {lab}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
