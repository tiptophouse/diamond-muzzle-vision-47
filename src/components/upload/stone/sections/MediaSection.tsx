import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { ImageUploadSection } from '@/components/upload/form/ImageUploadSection';

interface MediaSectionProps {
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  onGiaDataExtracted?: (data: any) => void;
}

/**
 * Media uploads section
 * Images and 360 viewer URLs
 */
export function MediaSection({ setValue, watch, onGiaDataExtracted }: MediaSectionProps) {
  return (
    <div className="space-y-4 px-3">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">תמונות ומדיה</h3>
        <p className="text-xs text-muted-foreground">העלו תמונות ותצוגת 360°</p>
      </div>
      
      <ImageUploadSection
        setValue={setValue}
        watch={watch}
        onGiaDataExtracted={onGiaDataExtracted}
      />
    </div>
  );
}
