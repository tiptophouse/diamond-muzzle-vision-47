import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondDetailsSection } from './DiamondDetailsSection';
import { CertificateSection } from './CertificateSection';
import { MeasurementsSection } from './MeasurementsSection';
import { DetailedGradingSection } from './DetailedGradingSection';
import { BusinessInfoSection } from './BusinessInfoSection';
import { ImageUploadSection } from './ImageUploadSection';

interface MobileFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sectionId: string | null;
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileFormDrawer({
  isOpen,
  onClose,
  title,
  sectionId,
  register,
  setValue,
  watch,
  errors
}: MobileFormDrawerProps) {
  const renderSection = () => {
    switch (sectionId) {
      case 'basic':
        return (
          <DiamondDetailsSection
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        );
      case 'certificate':
        return (
          <CertificateSection
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        );
      case 'measurements':
        return (
          <MeasurementsSection
            register={register}
            watch={watch}
            errors={errors}
          />
        );
      case 'grading':
        return (
          <DetailedGradingSection
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        );
      case 'business':
        return (
          <BusinessInfoSection
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        );
      case 'image':
        return (
          <ImageUploadSection
            setValue={setValue}
            watch={watch}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl font-semibold">{title}</SheetTitle>
          <SheetDescription className="text-base">
            Fill in the {title.toLowerCase()} information for your diamond
          </SheetDescription>
        </SheetHeader>
        
        <div className="overflow-y-auto h-full pb-20">
          {renderSection()}
        </div>
      </SheetContent>
    </Sheet>
  );
}