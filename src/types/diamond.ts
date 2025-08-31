
export interface Diamond {
  id: string;
  diamondId?: string;
  stockNumber: string;
  stock_number?: string;
  shape: string;
  carat: number;
  weight?: number;
  color: string;
  color_type?: 'Fancy' | 'Standard';
  clarity: string;
  cut: string;
  price: number;
  price_per_carat?: number;
  status: string;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  imageUrl?: string;
  picture?: string;
  gem360Url?: string;
  store_visible: boolean;
  certificateNumber?: string;
  certificate_number?: string;
  lab?: string;
  certificateUrl?: string;
  certificate_url?: string;
  // CSV-specific fields
  Image?: string;
  image?: string;
  'Video link'?: string;
  videoLink?: string;
  // Additional fields
  length?: number;
  width?: number;
  depth?: number;
  ratio?: number;
  tablePercentage?: number;
  table?: number;
  depthPercentage?: number;
  depth_percentage?: number;
  gridle?: string;
  culet?: string;
  certificateComment?: string;
  certificate_comment?: string;
  rapnet?: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
