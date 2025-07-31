import React from 'react';
import { useForm } from 'react-hook-form';
import { DiamondFormData } from './form/types';
import { DiamondDetailsSection } from '../upload/form/DiamondDetailsSection';
import { CertificateSection } from '../upload/form/CertificateSection';
import { MeasurementsSection } from '../upload/form/MeasurementsSection';
import { DetailedGradingSection } from '../upload/form/DetailedGradingSection';
import { BusinessInfoSection } from '../upload/form/BusinessInfoSection';
import { ImageUploadSection } from '../upload/form/ImageUploadSection';
import { DiamondFormActions } from './form/DiamondFormActions';
import { Diamond } from './InventoryTable';

interface DiamondFormProps {
  diamond?: Diamond;
  onSubmit: (data: DiamondFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DiamondForm({ diamond, onSubmit, onCancel, isLoading = false }: DiamondFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues: diamond ? {
      stockNumber: diamond.stockNumber || '',
      shape: diamond.shape || 'Round',
      carat: diamond.carat || 1,
      color: diamond.color || 'G',
      clarity: diamond.clarity || 'VS1',
      cut: diamond.cut || 'Excellent',
      price: diamond.price || 0,
      status: diamond.status || 'Available',
      imageUrl: diamond.imageUrl || '',
      // Map additional fields from diamond object if they exist
      certificateNumber: (diamond as any).certificateNumber || '',
      lab: (diamond as any).lab || 'GIA',
      fluorescence: (diamond as any).fluorescence || 'None',
      polish: (diamond as any).polish || 'Excellent',
      symmetry: (diamond as any).symmetry || 'Excellent',
      gridle: (diamond as any).gridle || 'Medium',
      culet: (diamond as any).culet || 'None',
      store_visible: (diamond as any).store_visible || false,
    } : {
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
      symmetry: 'Excellent',
      lab: 'GIA',
      gridle: 'Medium',
      culet: 'None',
      store_visible: false
    }
  });

  React.useEffect(() => {
    if (diamond && diamond.id) {
      console.log('Resetting form with diamond data:', diamond);
      reset({
        stockNumber: diamond.stockNumber || '',
        shape: diamond.shape || 'Round',
        carat: diamond.carat || 1,
        color: diamond.color || 'G',
        clarity: diamond.clarity || 'VS1',
        cut: diamond.cut || 'Excellent',
        price: diamond.price || 0,
        status: diamond.status || 'Available',
        imageUrl: diamond.imageUrl || '',
        certificateNumber: (diamond as any).certificateNumber || '',
        lab: (diamond as any).lab || 'GIA',
        fluorescence: (diamond as any).fluorescence || 'None',
        polish: (diamond as any).polish || 'Excellent',
        symmetry: (diamond as any).symmetry || 'Excellent',
        gridle: (diamond as any).gridle || 'Medium',
        culet: (diamond as any).culet || 'None',
        store_visible: (diamond as any).store_visible || false,
      });
    }
  }, [diamond?.id, reset]);

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('Form submitted with data:', data);
    
    // Validate required fields
    if (!data.stockNumber || data.stockNumber.trim() === '') {
      console.error('Stock number is required');
      return;
    }
    
    if (!data.carat || data.carat <= 0) {
      console.error('Valid carat weight is required');
      return;
    }
    
    if (!data.price || data.price <= 0) {
      console.error('Valid price is required');
      return;
    }
    
    const formattedData = {
      ...data,
      stockNumber: data.stockNumber.trim(),
      carat: Number(data.carat),
      price: Number(data.price),
      shape: data.shape || 'Round',
      color: data.color || 'G',
      clarity: data.clarity || 'VS1',
      cut: data.cut || 'Excellent',
      status: data.status || 'Available',
      imageUrl: data.imageUrl?.trim() || '',
      // Include all the new fields
      certificateNumber: data.certificateNumber?.trim() || '',
      certificateUrl: data.certificateUrl?.trim() || '',
      certificateComment: data.certificateComment?.trim() || '',
      lab: data.lab || 'GIA',
      length: data.length ? Number(data.length) : undefined,
      width: data.width ? Number(data.width) : undefined,
      depth: data.depth ? Number(data.depth) : undefined,
      ratio: data.ratio ? Number(data.ratio) : undefined,
      tablePercentage: data.tablePercentage ? Number(data.tablePercentage) : undefined,
      depthPercentage: data.depthPercentage ? Number(data.depthPercentage) : undefined,
      fluorescence: data.fluorescence || 'None',
      polish: data.polish || 'Excellent',
      symmetry: data.symmetry || 'Excellent',
      gridle: data.gridle || 'Medium',
      culet: data.culet || 'None',
      pricePerCarat: data.pricePerCarat ? Number(data.pricePerCarat) : undefined,
      rapnet: data.rapnet ? Number(data.rapnet) : undefined,
      store_visible: data.store_visible || false,
    };
    
    console.log('Formatted form data:', formattedData);
    onSubmit(formattedData);
  };

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <DiamondDetailsSection
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

      <DiamondFormActions
        diamond={diamond}
        isLoading={isLoading}
        onCancel={onCancel}
      />
    </form>
  );
}
