
export interface Diamond {
  id: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  price_per_carat?: number;
  certificate_number?: number;
  certificate_url?: string;
  picture?: string;
  video_url?: string;
  status?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  store_visible?: boolean;
  deleted_at?: string | null;
}
