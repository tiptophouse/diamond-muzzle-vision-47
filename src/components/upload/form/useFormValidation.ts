
import { DiamondFormData } from '@/components/inventory/form/types';

export const useFormValidation = () => {
  const validateFormData = (data: DiamondFormData): boolean => {
    console.log('🔍 VALIDATION: Starting form validation with data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.stockNumber || data.stockNumber.trim() === '') {
      console.error('❌ VALIDATION: Stock number is required - value:', data.stockNumber);
      return false;
    }
    console.log('✅ VALIDATION: Stock number valid:', data.stockNumber);
    
    if (!data.carat || data.carat <= 0) {
      console.error('❌ VALIDATION: Valid carat weight is required - value:', data.carat);
      return false;
    }
    console.log('✅ VALIDATION: Carat valid:', data.carat);
    
    if (!data.price || data.price <= 0) {
      console.error('❌ VALIDATION: Valid price is required - value:', data.price);
      return false;
    }
    console.log('✅ VALIDATION: Price valid:', data.price);
    
    // Check for any suspicious field values
    console.log('🔍 VALIDATION: Checking optional fields...');
    console.log('  - Shape:', data.shape);
    console.log('  - Color:', data.color);
    console.log('  - Clarity:', data.clarity);
    console.log('  - Cut:', data.cut);
    console.log('  - Fluorescence:', data.fluorescence);
    console.log('  - Polish:', data.polish);
    console.log('  - Symmetry:', data.symmetry);
    console.log('  - Lab:', data.lab);
    console.log('  - Certificate Number:', data.certificateNumber);
    console.log('  - Length:', data.length);
    console.log('  - Width:', data.width);
    console.log('  - Depth:', data.depth);
    console.log('  - Table %:', data.tablePercentage);
    console.log('  - Depth %:', data.depthPercentage);
    
    console.log('✅ VALIDATION: All validations passed successfully');
    return true;
  };

  const formatFormData = (data: DiamondFormData, showCutField: boolean): DiamondFormData => {
    console.log('🔍 FORMAT: Starting data formatting with showCutField:', showCutField);
    console.log('🔍 FORMAT: Input data:', JSON.stringify(data, null, 2));
    
    const formatted = {
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
    };
    
    console.log('🔍 FORMAT: Formatted data:', JSON.stringify(formatted, null, 2));
    
    // Check for any NaN values that could cause issues
    const numericFields = ['carat', 'price', 'length', 'width', 'depth', 'ratio', 'tablePercentage', 'depthPercentage', 'pricePerCarat', 'rapnet'];
    numericFields.forEach(field => {
      const value = formatted[field as keyof DiamondFormData];
      if (value !== undefined && isNaN(Number(value))) {
        console.error(`❌ FORMAT: Invalid numeric value for ${field}: ${value}`);
      } else if (value !== undefined) {
        console.log(`✅ FORMAT: Valid numeric value for ${field}: ${value}`);
      }
    });
    
    return formatted;
  };

  return { validateFormData, formatFormData };
};
