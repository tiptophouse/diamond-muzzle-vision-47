
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
  rapPercentage?: number;
  status: string;
  storeVisible?: boolean;
  
  // Image
  picture?: string;
}

// API payload format based on the backend expectations
export interface DiamondApiPayload {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  lab: string;
  certificate_number: number;
  length: number;
  width: number;
  depth: number;
  ratio: number;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  table: number;
  depth_percentage: number;
  gridle: string;
  culet: string;
  certificate_comment: string;
  rapnet: number;
  price_per_carat: number;
  picture: string;
}
