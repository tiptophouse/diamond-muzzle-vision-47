
export interface Diamond {
  id: string;
  diamondId?: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  color_type?: 'Fancy' | 'Standard';
  clarity: string;
  cut: string;
  price: number;
  status: string;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  imageUrl?: string;
  gem360Url?: string;
  store_visible: boolean;
  certificateNumber?: string;
  lab?: string;
  certificateUrl?: string;
  // Add CSV-specific fields
  Image?: string;
  image?: string;
  picture?: string;
  'Video link'?: string;
  videoLink?: string;
  // Optional fields for API compatibility
  stock_number?: string;
  depth?: number;
  table?: number;
  measurements?: string;
  certificate?: string;
  certificate_number?: string;
  image_url?: string;
  video_url?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}
