import { UseFormSetValue } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';

/**
 * Maps GIA scan data to form fields
 */
export function mapGiaDataToForm(
  giaData: any, 
  setValue: UseFormSetValue<DiamondFormData>
): void {
  const mappings: Array<{
    source: string;
    target: keyof DiamondFormData;
    transform?: (value: any) => any;
  }> = [
    { source: 'stock', target: 'stockNumber' },
    { source: 'shape', target: 'shape' },
    { source: 'weight', target: 'carat', transform: Number },
    { source: 'color', target: 'color' },
    { source: 'clarity', target: 'clarity' },
    { source: 'cut', target: 'cut' },
    { source: 'certificate_number', target: 'certificateNumber', transform: (v) => v?.toString() },
    { source: 'lab', target: 'lab' },
    { source: 'fluorescence', target: 'fluorescence' },
    { source: 'polish', target: 'polish' },
    { source: 'symmetry', target: 'symmetry' },
    { source: 'gridle', target: 'gridle' },
    { source: 'culet', target: 'culet' },
    { source: 'length', target: 'length', transform: Number },
    { source: 'width', target: 'width', transform: Number },
    { source: 'depth', target: 'depth', transform: Number },
    { source: 'ratio', target: 'ratio', transform: Number },
    { source: 'table_percentage', target: 'tablePercentage', transform: Number },
    { source: 'depth_percentage', target: 'depthPercentage', transform: Number },
    { source: 'price_per_carat', target: 'pricePerCarat', transform: Number },
    { source: 'rapnet', target: 'rapnet', transform: Number },
    { source: 'picture', target: 'picture' },
    { source: 'certificate_comment', target: 'certificateComment' },
  ];

  // Apply all mappings
  mappings.forEach(({ source, target, transform }) => {
    const value = giaData[source];
    if (value !== undefined && value !== null && value !== '') {
      setValue(target, transform ? transform(value) : value);
    }
  });

  // Handle certificate URL with fallback
  const certificateUrl = giaData.certificate_url || giaData.certificateUrl;
  if (certificateUrl) {
    setValue('certificateUrl', certificateUrl);
  }
}
