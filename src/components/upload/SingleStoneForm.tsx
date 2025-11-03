
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { BasicInfoSection } from '../upload/stone/sections/BasicInfoSection';
import { CertificateSection } from './form/CertificateSection';
import { MeasurementsSection } from './form/MeasurementsSection';
import { DetailedGradingSection } from './form/DetailedGradingSection';
import { BusinessInfoSection } from './form/BusinessInfoSection';
import { ImageUploadSection } from './form/ImageUploadSection';
import { FormActions } from './form/FormActions';
import { useFormValidation } from './form/useFormValidation';

interface SingleStoneFormProps {
  initialData?: Partial<DiamondFormData>;
  onSubmit: (data: DiamondFormData) => void;
  isLoading?: boolean;
}

export function SingleStoneForm({ initialData, onSubmit, isLoading = false }: SingleStoneFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues: {
      stockNumber: '',
      carat: 1,
      price: 0,
      status: 'Available',
      picture: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent',
      lab: 'GIA',
      gridle: 'Medium',
      culet: 'None',
      storeVisible: false
    }
  });

  const { validateFormData, formatFormData } = useFormValidation();

  // Update form when initialData changes (from OCR scan)
  useEffect(() => {
    if (initialData) {
      console.log('Updating form with initial data:', initialData);
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof DiamondFormData, value);
        }
      });
    }
  }, [initialData, setValue]);

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('Form submitted with data:', data);
    
    if (!validateFormData(data)) {
      return;
    }
    
    const formattedData = formatFormData(data, showCutField);
    console.log('Formatted form data:', formattedData);
    onSubmit(formattedData);
  };

  const resetForm = () => {
    reset({
      stockNumber: '',
      carat: 1,
      price: 0,
      status: 'Available',
      picture: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent',
      lab: 'GIA',
      gridle: 'Medium',
      culet: 'None',
      storeVisible: false
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <BasicInfoSection
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      <CertificateSection
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      <MeasurementsSection
        register={register}
        watch={watch}
        errors={errors}
      />

      <DetailedGradingSection
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      <BusinessInfoSection
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      <ImageUploadSection
        setValue={setValue}
        watch={watch}
      />

      <FormActions
        onReset={resetForm}
        isLoading={isLoading}
      />
    </form>
  );
}
