
export interface DiamondFormData {
  // Basic Information
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  lab: string;
  
  // Certificate Information
  certificate_number: number;
  certificate_comment: string;
  picture: string;
  
  // Physical Measurements
  length: number;
  width: number;
  depth: number;
  ratio: number;
  table: number;
  depth_percentage: number;
  
  // Detailed Grading
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  gridle: string;
  culet: string;
  
  // Business Information
  rapnet: number;
  price_per_carat: number;
}

// API payload format that matches your backend exactly
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
