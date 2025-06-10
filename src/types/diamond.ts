
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
  imageUrl?: string;
  store_visible?: boolean;
  // Optional extended properties for detailed diamond data
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  lab?: string;
  length?: number;
  width?: number;
  depth?: number;
  table?: number;
  depthPercentage?: number;
  ratio?: number;
  culet?: string;
  gridle?: string;
  pricePerCarat?: number;
  rapnet?: number;
  certificateComment?: string;
}

export interface DiamondFilters {
  shapes: string[];
  colors: string[];
  clarities: string[];
  caratRange: [number, number];
  priceRange: [number, number];
  cuts?: string[];
  statuses?: string[];
}

export interface StoreFilters extends DiamondFilters {
  // Store-specific filter extensions can go here
}
