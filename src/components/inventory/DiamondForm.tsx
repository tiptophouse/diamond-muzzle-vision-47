
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
import { Diamond } from '@/types/diamond';
import { useAddDiamond } from '@/hooks/inventory/useAddDiamond';
import { useUpdateDiamond } from '@/hooks/inventory/useUpdateDiamond';
import { useToast } from '@/hooks/use-toast';

interface DiamondFormProps {
  diamond?: Diamond;
  onSubmit?: (data: DiamondFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DiamondForm({ diamond, onSubmit, onCancel, isLoading = false }: DiamondFormProps) {
  const { toast } = useToast();
  const { addDiamond, isLoading: isAdding } = useAddDiamond(() => {
    toast({
      title: "Success",
      description: "Diamond added successfully",
    });
    onCancel(); // Close the form
  });
  
  const { updateDiamond } = useUpdateDiamond(() => {
    toast({
      title: "Success", 
      description: "Diamond updated successfully",
    });
    onCancel(); // Close the form
  });

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
      picture: diamond.imageUrl || '',
      certificateNumber: diamond.certificateNumber || '',
      lab: diamond.lab || 'GIA',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent',
      gridle: 'Medium',
      culet: 'None',
      storeVisible: diamond.store_visible || false,
    } : {
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
        picture: diamond.imageUrl || '',
        certificateNumber: diamond.certificateNumber || '',
        lab: diamond.lab || 'GIA',
        fluorescence: 'None',
        polish: 'Excellent',
        symmetry: 'Excellent',
        gridle: 'Medium',
        culet: 'None',
        storeVisible: diamond.store_visible || false,
      });
    }
  }, [diamond?.id, reset]);

  const handleFormSubmit = async (data: DiamondFormData) => {
    console.log('Form submitted with data:', data);
    
    // Validate required fields
    if (!data.stockNumber || data.stockNumber.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Stock number is required",
      });
      return;
    }
    
    if (!data.carat || data.carat <= 0) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Valid carat weight is required",
      });
      return;
    }
    
    if (!data.price || data.price <= 0) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Valid price is required",
      });
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
      picture: data.picture?.trim() || '',
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
      storeVisible: data.storeVisible || false,
    };
    
    console.log('Formatted form data:', formattedData);
    
    try {
      if (diamond?.id) {
        // Update existing diamond
        await updateDiamond(diamond.id, formattedData);
      } else {
        // Add new diamond
        await addDiamond(formattedData);
      }
      
      // Call custom onSubmit if provided
      if (onSubmit) {
        onSubmit(formattedData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save diamond. Please try again.",
      });
    }
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
        isLoading={isLoading || isAdding}
        onCancel={onCancel}
      />
    </form>
  );
}
