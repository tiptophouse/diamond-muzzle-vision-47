import { useState, useEffect, useCallback } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { supabase } from "@/integrations/supabase/client";
import { detectFancyColor } from "@/utils/fancyColorUtils";

export interface P2PDiamond extends Diamond {
  user_id: number;
  owner_name?: string;
}

/**
 * Hook to fetch diamonds from a specific seller for P2P store access
 */
export function useP2PStoreData(sellerId?: string) {
  const [diamonds, setDiamonds] = useState<P2PDiamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<{ name?: string; telegram_id: number } | null>(null);

  // Helper function to parse numbers from various formats
  const parseNumber = useCallback((value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,\s]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, []);

  const fetchP2PStoreData = useCallback(async () => {
    if (!sellerId) {
      setDiamonds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🏪 Fetching P2P store data for seller:', sellerId);

      // Convert sellerId to number for database query
      const sellerTelegramId = parseInt(sellerId, 10);

      // Fetch seller profile info
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, telegram_id')
        .eq('telegram_id', sellerTelegramId)
        .single();

      if (profileData) {
        const ownerName = `${profileData.first_name}${profileData.last_name ? ` ${profileData.last_name}` : ''}`;
        setOwnerInfo({ 
          name: ownerName,
          telegram_id: profileData.telegram_id 
        });
      }

      // Fetch diamonds from the specific seller
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', sellerTelegramId)
        .eq('store_visible', true)
        .eq('status', 'Available')
        .is('deleted_at', null);

      if (inventoryError) {
        console.error('❌ Error fetching P2P inventory:', inventoryError);
        setError('Failed to load seller\'s diamonds');
        return;
      }

      if (!inventoryData || inventoryData.length === 0) {
        console.log('📭 No diamonds found for seller:', sellerId);
        setDiamonds([]);
        return;
      }

      // Transform the data to match Diamond interface
      const transformedDiamonds: P2PDiamond[] = inventoryData.map((item) => {
        const weight = parseNumber(item.weight);
        const pricePerCarat = parseNumber(item.price_per_carat);
        const price = Math.round(pricePerCarat * weight);

        const colorType = detectFancyColor(item.color || 'D').isFancyColor ? 'Fancy' : 'Standard';

        return {
          id: String(item.id),
          stockNumber: item.stock_number || '',
          shape: item.shape || 'Round',
          carat: weight,
          color: item.color || 'D',
          color_type: colorType as 'Fancy' | 'Standard',
          clarity: item.clarity || 'FL',
          cut: item.cut || 'Excellent',
          polish: item.polish,
          symmetry: item.symmetry,
          price: price,
          status: item.status || 'Available',
          imageUrl: item.picture,
          gem360Url: item.gem360_url,
          store_visible: true,
          certificateNumber: String(item.certificate_number || ''),
          lab: item.lab,
          certificateUrl: item.certificate_url,
          user_id: item.user_id,
          owner_name: ownerInfo?.name,
        };
      });

      console.log('✅ P2P store data loaded:', {
        seller: sellerId,
        diamondCount: transformedDiamonds.length,
        ownerName: ownerInfo?.name
      });

      setDiamonds(transformedDiamonds);

    } catch (err) {
      console.error('❌ P2P store data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load seller\'s store');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId, parseNumber, ownerInfo?.name]);

  useEffect(() => {
    fetchP2PStoreData();
  }, [fetchP2PStoreData]);

  const refetch = useCallback(() => {
    return fetchP2PStoreData();
  }, [fetchP2PStoreData]);

  return {
    diamonds,
    loading,
    error,
    refetch,
    ownerInfo,
  };
}