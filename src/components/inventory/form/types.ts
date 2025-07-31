
export interface DiamondFormData {
  // Basic Information
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  
  // Certificate Information
  certificateNumber?: string;
  certificateUrl?: string;
  certificateComment?: string;
  lab?: string;
  
  // Physical Measurements
  length?: number;
  width?: number;
  depth?: number;
  ratio?: number;
  
  // Detailed Grading
  tablePercentage?: number;
  depthPercentage?: number;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  gridle?: string;
  culet?: string;
  
  // Business Information
  price: number;
  pricePerCarat?: number;
  rapnet?: number;
  status: string;
  storeVisible?: boolean;
  
  // Enhanced Media Fields
  picture?: string;
  v360Url?: string;
  gem360Url?: string;
  videoUrl?: string;
  certificateImageUrl?: string;
  giaReportPdf?: string;
}
