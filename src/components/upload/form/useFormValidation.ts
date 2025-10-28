
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
      picture: data.picture?.trim() || '',
      // Include all comprehensive fields
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
      gridle: data.gridle || 'Medium',
      culet: data.culet || 'None',
      pricePerCarat: data.pricePerCarat ? Number(data.pricePerCarat) : undefined,
      rapnet: data.rapnet ? Number(data.rapnet) : undefined,
      storeVisible: data.storeVisible !== undefined ? data.storeVisible : true,
      segomaUrl: data.segomaUrl?.trim() || '',
    };
  };

  return { validateFormData, formatFormData };
};
