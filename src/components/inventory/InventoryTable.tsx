export interface Diamond {
  id: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  store_visible?: boolean;
  // Image fields from CSV mapping
  Image?: string;
  imageUrl?: string;
  picture?: string;
  image?: string;
  // Video fields
  'Video link'?: string;
  videoLink?: string;
  gem360Url?: string;
  // Certificate fields
  certificateUrl?: string;
  lab?: string;
  // Additional properties
  depth?: number; // Add missing depth property
  table?: number;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  measurements?: string;
}
