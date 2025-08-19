
import { useState, useEffect, useCallback } from 'react';
import { useSecureFastAPIAuthContext } from '@/context/SecureFastAPIAuthContext';
import { secureApi } from '@/lib/api/secureClient';

export interface Diamond {
  id: number;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  certificate_number?: string;
  certificate_url?: string;
  certificate_image_url?: string;
  price: number;
  total_price: number;
  depth?: number;
  table_percentage?: number;
  crown_angle?: number;
  pavilion_angle?: number;
  crown_height?: number;
  pavilion_depth?: number;
  girdle_thickness?: string;
  culet?: string;
  measurements?: string;
  length?: number;
  width?: number;
  height?: number;
  lab?: string;
  certificate_comment?: string;
  key_to_symbols?: string;
  fancy_color?: string;
  fancy_intensity?: string;
  fancy_overtone?: string;
  milky?: string;
  eye_clean?: string;
  shade?: string;
  luster?: string;
  brown?: string;
  green?: string;
  origin?: string;
  image_url?: string;
  video_url?: string;
  hd_image_url?: string;
  hd_video_url?: string;
  certificate_pdf_url?: string;
  v360_url?: string;
  gem360_url?: string;
  is_matched?: boolean;
  location?: string;
  memo_number?: string;
  treatment?: string;
  inscription?: string;
  available?: boolean;
  rapnet_plus_price?: number;
  rapnet_price_per_carat?: number;
  discount_percent?: number;
  created_at?: string;
  updated_at?: string;
}

export function useInventoryData() {
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, user } = useSecureFastAPIAuthContext();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('🔍 useInventoryData: Not authenticated, skipping fetch');
      setLoading(false);
      return;
    }

    console.log('📊 useInventoryData: Fetching diamonds for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const response = await secureApi.get<Diamond[]>('/diamonds/');
      
      if (response.data) {
        console.log('✅ useInventoryData: Successfully fetched', response.data.length, 'diamonds');
        setAllDiamonds(response.data);
      } else if (response.error) {
        console.error('❌ useInventoryData: Error fetching diamonds:', response.error);
        setError(response.error);
        setAllDiamonds([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch diamonds';
      console.error('❌ useInventoryData: Exception:', errorMessage);
      setError(errorMessage);
      setAllDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    allDiamonds,
    loading,
    error,
    fetchData,
  };
}
