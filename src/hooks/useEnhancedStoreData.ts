
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

      // Enhanced transformation with image gallery support
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
          description: item.description || undefined,
        };
      });

      // Generate SEO descriptions for premium diamonds
      await generatePremiumDescriptions(transformedDiamonds.slice(0, 20));

      setDiamonds(transformedDiamonds);
      console.log(`✅ ENHANCED STORE: Loaded ${transformedDiamonds.length} diamonds with premium features`);
    } catch (err) {
      console.error('Error fetching enhanced store data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load diamonds');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePremiumDescriptions = async (diamonds: Diamond[]) => {
    try {
      for (const diamond of diamonds) {
        if (diamond.description) continue; // Skip if already has description

        // Generate premium SEO description
        const prompt = `Create a luxurious, premium product description for this exceptional diamond:
        
        ${diamond.carat} carat ${diamond.shape} diamond
        Color: ${diamond.color} | Clarity: ${diamond.clarity} | Cut: ${diamond.cut}
        Price: $${diamond.price.toLocaleString()}
        Stock #: ${diamond.stockNumber}
        ${diamond.lab ? `${diamond.lab} Certified` : ''}
        ${diamond.fluorescence ? `Fluorescence: ${diamond.fluorescence}` : ''}
        
        Write a sophisticated 2-3 sentence description that emphasizes luxury, rarity, and exceptional beauty. Use premium language that appeals to discerning buyers and highlights the diamond's investment value.`;

        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            message: prompt,
            user_id: user?.id,
            conversation_history: []
          },
        });

        if (!error && data?.response) {
          diamond.description = data.response;
        }
      }
    } catch (error) {
      console.warn('Failed to generate premium descriptions:', error);
    }
  };

  return {
    diamonds,
    loading,
    error,
    refetch: fetchStoreData,
  };
}
