
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
  certificateNumber?: string;
  certificateUrl?: string;
  lab?: string;
  gem360Url?: string;
  weight?: number;
  picture?: string;
  price_per_carat?: number;
  certificate_number?: number;
}
