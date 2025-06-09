
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function useStoreData() {
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
      console.log('🔍 STORE: Fetching from external API for user:', userId);
      
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
      console.log('🔍 STORE: API Response:', data?.length || 0, 'items');

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from API');
      }

      // Transform external API data to Diamond interface
      const transformedDiamonds: Diamond[] = data.map((item: any, index: number) => ({
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
        store_visible: true, // Make all items visible in store
        fluorescence: item.fluorescence || item.Fluo || 'None',
        lab: item.lab || item.Lab || 'GIA',
        certificate_number: item.certificate_number || item.CertNumber,
        polish: item.polish || item.Polish || 'Excellent',
        symmetry: item.symmetry || item.Symm || 'Excellent',
        table_percentage: item.table_percentage || item.Table,
        depth_percentage: item.depth_percentage || item.Depth,
        measurements: item.measurements || item.Measurements,
        ratio: item.ratio || item.Ratio,
      }));

      // Generate SEO descriptions for the first few diamonds
      await generateSEODescriptions(transformedDiamonds.slice(0, 10));

      setDiamonds(transformedDiamonds);
      console.log(`✅ STORE: Loaded ${transformedDiamonds.length} diamonds from external API`);
    } catch (err) {
      console.error('Error fetching store data from API:', err);
      setError(err instanceof Error ? err.message : 'Failed to load diamonds');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSEODescriptions = async (diamonds: Diamond[]) => {
    try {
      for (const diamond of diamonds) {
        // Generate SEO-friendly description using OpenAI
        const prompt = `Create a compelling, SEO-optimized product description for this diamond:
        
        ${diamond.carat} carat ${diamond.shape} diamond
        Color: ${diamond.color}
        Clarity: ${diamond.clarity}
        Cut: ${diamond.cut}
        Price: $${diamond.price.toLocaleString()}
        Stock #: ${diamond.stockNumber}
        ${diamond.lab ? `Certified by: ${diamond.lab}` : ''}
        ${diamond.fluorescence ? `Fluorescence: ${diamond.fluorescence}` : ''}
        
        Write a 2-3 sentence description that highlights the diamond's beauty, quality, and value. Make it engaging for potential buyers and include relevant keywords for SEO.`;

        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            message: prompt,
            user_id: user?.id,
            conversation_history: []
          },
        });

        if (!error && data?.response) {
          // Store the generated description (you could save this to database if needed)
          diamond.description = data.response;
        }
      }
    } catch (error) {
      console.warn('Failed to generate SEO descriptions:', error);
    }
  };

  return {
    diamonds,
    loading,
    error,
    refetch: fetchStoreData,
  };
}
