
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
      stock: diamond.stockNumber || '',
      shape: diamond.shape || 'Round',
      weight: diamond.carat || 1,
      color: diamond.color || 'G',
      clarity: diamond.clarity || 'VS1',
      cut: diamond.cut || 'Excellent',
      price_per_carat: diamond.price || 0,
      picture: diamond.imageUrl || '',
      certificate_number: (diamond as any).certificateNumber || 0,
      lab: (diamond as any).lab || 'GIA',
      fluorescence: (diamond as any).fluorescence || 'None',
      polish: (diamond as any).polish || 'Excellent',
      symmetry: (diamond as any).symmetry || 'Excellent',
      gridle: (diamond as any).gridle || 'Medium',
      culet: (diamond as any).culet || 'None',
      certificate_comment: (diamond as any).certificateComment || '',
      length: (diamond as any).length || 0,
      width: (diamond as any).width || 0,
      depth: (diamond as any).depth || 0,
      ratio: (diamond as any).ratio || 0,
      table: (diamond as any).table || 0,
      depth_percentage: (diamond as any).depth_percentage || 0,
      rapnet: (diamond as any).rapnet || 0,
    } : {
      stock: '',
      weight: 1,
      price_per_carat: 0,
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
      certificate_number: 0,
      certificate_comment: '',
      length: 0,
      width: 0,
      depth: 0,
      ratio: 0,
      table: 0,
      depth_percentage: 0,
      rapnet: 0,
    }
  });

  React.useEffect(() => {
    if (diamond && diamond.id) {
      console.log('Resetting form with diamond data:', diamond);
      reset({
        stock: diamond.stockNumber || '',
        shape: diamond.shape || 'Round',
        weight: diamond.carat || 1,
        color: diamond.color || 'G',
        clarity: diamond.clarity || 'VS1',
        cut: diamond.cut || 'Excellent',
        price_per_carat: diamond.price || 0,
        picture: diamond.imageUrl || '',
        certificate_number: (diamond as any).certificateNumber || 0,
        lab: (diamond as any).lab || 'GIA',
        fluorescence: (diamond as any).fluorescence || 'None',
        polish: (diamond as any).polish || 'Excellent',
        symmetry: (diamond as any).symmetry || 'Excellent',
        gridle: (diamond as any).gridle || 'Medium',
        culet: (diamond as any).culet || 'None',
        certificate_comment: (diamond as any).certificateComment || '',
        length: (diamond as any).length || 0,
        width: (diamond as any).width || 0,
        depth: (diamond as any).depth || 0,
        ratio: (diamond as any).ratio || 0,
        table: (diamond as any).table || 0,
        depth_percentage: (diamond as any).depth_percentage || 0,
        rapnet: (diamond as any).rapnet || 0,
      });
    }
  }, [diamond?.id, reset]);

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('Form submitted with data:', data);
    
    // Validate required fields
    if (!data.stock || data.stock.trim() === '') {
      console.error('Stock number is required');
      return;
    }
    
    if (!data.weight || data.weight <= 0) {
      console.error('Valid weight is required');
      return;
    }
    
    if (!data.price_per_carat || data.price_per_carat <= 0) {
      console.error('Valid price per carat is required');
      return;
    }
    
    const formattedData = {
      ...data,
      stock: data.stock.trim(),
      weight: Number(data.weight),
      price_per_carat: Number(data.price_per_carat),
      shape: data.shape || 'Round',
      color: data.color || 'G',
      clarity: data.clarity || 'VS1',
      cut: data.cut || 'Excellent',
      picture: data.picture?.trim() || '',
      certificate_number: data.certificate_number || 0,
      certificate_comment: data.certificate_comment?.trim() || '',
      lab: data.lab || 'GIA',
      length: data.length ? Number(data.length) : 0,
      width: data.width ? Number(data.width) : 0,
      depth: data.depth ? Number(data.depth) : 0,
      ratio: data.ratio ? Number(data.ratio) : 0,
      table: data.table ? Number(data.table) : 0,
      depth_percentage: data.depth_percentage ? Number(data.depth_percentage) : 0,
      fluorescence: data.fluorescence || 'None',
      polish: data.polish || 'Excellent',
      symmetry: data.symmetry || 'Excellent',
      gridle: data.gridle || 'Medium',
      culet: data.culet || 'None',
      rapnet: data.rapnet ? Number(data.rapnet) : 0,
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
