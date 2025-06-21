
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondDetailsSection } from './form/DiamondDetailsSection';
import { ManualInputSection } from './form/ManualInputSection';
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
      imageUrl: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent'
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
      imageUrl: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent'
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <DiamondDetailsSection
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      <ManualInputSection
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      <FormActions
        onReset={resetForm}
        isLoading={isLoading}
      />
    </form>
  );
}
