
import { DiamondFormData } from '@/components/inventory/form/types';

export const useFormValidation = () => {
  const validateFormData = (data: DiamondFormData): boolean => {
    // Validate required fields
    if (!data.stockNumber || data.stockNumber.trim() === '') {
      console.error('Stock number is required');
      return false;
    }
    
    if (!data.carat || data.carat <= 0) {
      console.error('Valid carat weight is required');
      return false;
    }
    
    if (!data.price || data.price <= 0) {
      console.error('Valid price is required');
      return false;
    }
    
    return true;
  };

  const formatFormData = (data: DiamondFormData, showCutField: boolean): DiamondFormData => {
    return {
      ...data,
      stockNumber: data.stockNumber.trim(),
      carat: Number(data.carat),
      price: Number(data.price),
      shape: data.shape || 'Round',
      color: data.color || 'G',
      clarity: data.clarity || 'VS1',
      cut: showCutField ? (data.cut || 'Excellent') : 'N/A',
      fluorescence: data.fluorescence || 'None',
      polish: data.polish || 'Excellent',
      symmetry: data.symmetry || 'Excellent',
      status: data.status || 'Available',
      imageUrl: data.imageUrl?.trim() || '',
    };
  };

  return { validateFormData, formatFormData };
};
