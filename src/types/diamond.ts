
export interface Diamond {
  id?: string;
  stock_number?: string;
  shape?: string;
  weight?: number;
  color?: string;
  clarity?: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  price_per_carat?: number;
  total_price?: number;
  length?: number;
  width?: number;
  depth?: number;
  table?: number;
  crown_angle?: number;
  crown_height?: number;
  pavilion_angle?: number;
  pavilion_depth?: number;
  girdle?: string;
  culet?: string;
  certificate?: string;
  certificate_number?: string;
  certificate_url?: string;
  picture?: string;
  video?: string;
  status?: string;
  location?: string;
  lab?: string;
  report_date?: string;
  measurements?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  store_visible?: boolean;
}

export interface DiamondFormData extends Omit<Diamond, 'id' | 'created_at' | 'updated_at'> {
  // Form-specific properties can be added here
}
