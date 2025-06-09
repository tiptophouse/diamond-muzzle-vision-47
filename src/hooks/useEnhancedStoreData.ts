
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function useEnhancedStoreData() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useTelegramAuth();

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the external API to get all stones - default to user 2138564172 if no user
      const userId = user?.id || 2138564172;
      console.log('🔍 ENHANCED STORE: Fetching from external API for user:', userId);
      
      const response = await fetch(`https://api.mazalbot.com/api/v1/get_all_stones?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ifj9ov1rh20fslfp',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 ENHANCED STORE: API Response:', data?.length || 0, 'items');

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from API');
      }

      // Fast transformation without OpenAI calls - NO AI DESCRIPTIONS
      const transformedDiamonds: Diamond[] = data.map((item: any, index: number) => {
        // Handle multiple images from CSV or API
        const additionalImages: string[] = [];
        
        // Check for multiple image fields
        if (item.picture2) additionalImages.push(item.picture2);
        if (item.picture3) additionalImages.push(item.picture3);
        if (item.picture4) additionalImages.push(item.picture4);
        if (item.image_gallery && Array.isArray(item.image_gallery)) {
          additionalImages.push(...item.image_gallery);
        }

        return {
          id: item.id || `api-${index}`,
          stockNumber: item.stock_number || item.Stock || `STOCK-${index}`,
          shape: item.shape || item.Shape || 'Round',
          carat: Number(item.weight || item.Weight || item.carat || 1),
          color: item.color || item.Color || 'D',
          clarity: item.clarity || item.Clarity || 'VS1',
          cut: item.cut || item.Cut || 'Excellent',
          price: Number(item.price_per_carat || item['Price/Crt'] || item.price || 1000) * Number(item.weight || item.Weight || item.carat || 1),
          status: item.status || 'Available',
          imageUrl: item.picture || item.Pic || item.photo || undefined,
          additional_images: additionalImages,
          store_visible: true,
          fluorescence: item.fluorescence || item.Fluo || 'None',
          lab: item.lab || item.Lab || 'GIA',
          certificate_number: item.certificate_number || item.CertNumber,
          polish: item.polish || item.Polish || 'Excellent',
          symmetry: item.symmetry || item.Symm || 'Excellent',
          table_percentage: item.table_percentage || item.Table,
          depth_percentage: item.depth_percentage || item.Depth,
          measurements: item.measurements || item.Measurements,
          ratio: item.ratio || item.Ratio,
          // NO OpenAI description - saves money and improves speed
        };
      });

      setDiamonds(transformedDiamonds);
      console.log(`✅ ENHANCED STORE: Loaded ${transformedDiamonds.length} diamonds with optimized performance`);
    } catch (err) {
      console.error('Error fetching enhanced store data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load diamonds');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: diamonds.length,
    available: diamonds.filter(d => d.status === 'Available').length,
    avgPrice: diamonds.length > 0 
      ? Math.round(diamonds.reduce((sum, d) => sum + d.price, 0) / diamonds.length)
      : 0
  };

  return {
    diamonds,
    loading,
    error,
    stats,
    refreshData: fetchStoreData,
  };
}
