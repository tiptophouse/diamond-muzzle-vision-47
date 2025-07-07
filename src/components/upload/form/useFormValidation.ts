
import { DiamondFormData } from '@/components/inventory/form/types';

export const useFormValidation = () => {
  const validateFormData = (data: DiamondFormData): boolean => {
    // Validate required fields
    if (!data.stock || data.stock.trim() === '') {
      console.error('Stock number is required');
      return false;
    }
    
    if (!data.weight || data.weight <= 0) {
      console.error('Valid weight is required');
      return false;
    }
    
    if (!data.price_per_carat || data.price_per_carat <= 0) {
      console.error('Valid price per carat is required');
      return false;
    }
    
    return true;
  };

  const formatFormData = (data: DiamondFormData, showCutField: boolean): DiamondFormData => {
    return {
      ...data,
      stock: data.stock.trim(),
      weight: Number(data.weight),
      price_per_carat: Number(data.price_per_carat),
      shape: data.shape || 'Round',
      color: data.color || 'G',
      clarity: data.clarity || 'VS1',
      cut: showCutField ? (data.cut || 'Excellent') : 'N/A',
      fluorescence: data.fluorescence || 'None',
      polish: data.polish || 'Excellent',
      symmetry: data.symmetry || 'Excellent',
      picture: data.picture?.trim() || '',
      // Include all comprehensive fields
      certificate_number: data.certificate_number || 0,
      certificate_comment: data.certificate_comment?.trim() || '',
      lab: data.lab || 'GIA',
      length: data.length ? Number(data.length) : 0,
      width: data.width ? Number(data.width) : 0,
      depth: data.depth ? Number(data.depth) : 0,
      ratio: data.ratio ? Number(data.ratio) : 0,
      table: data.table ? Number(data.table) : 0,
      depth_percentage: data.depth_percentage ? Number(data.depth_percentage) : 0,
      gridle: data.gridle || 'Medium',
      culet: data.culet || 'None',
      rapnet: data.rapnet ? Number(data.rapnet) : 0,
    };
  };

  return { validateFormData, formatFormData };
};
