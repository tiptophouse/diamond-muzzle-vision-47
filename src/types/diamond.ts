
export interface Diamond {
  id: string;
  diamondId?: string; // Add for backward compatibility
  stockNumber?: string;
  shape: string;
  carat: number;
  color: string;
  color_type?: string; // Add for color type support
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  certificateNumber?: string; // Keep this for backward compatibility
  certificateUrl?: string;
  price?: number;
  depth?: number;
  table?: number;
  measurements?: string;
  lab?: string;
  location?: string;
  availability?: string;
  status?: string; // Add missing status property
  comment?: string;
  store_visible?: boolean;
  picture?: string;
  imageUrl?: string; // Add for image filtering
  gem360Url?: string; // Add for 360 view filtering
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}
