
import { useState, useEffect } from "react";
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

      // Fast transformation without any OpenAI calls
      const transformedDiamonds: Diamond[] = data.map((item: any, index: number) => {
        const additionalImages: string[] = [];
        
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
          // Use static descriptions instead of OpenAI generation
          description: generateStaticDescription(item),
        };
      });

      setDiamonds(transformedDiamonds);
      console.log(`✅ ENHANCED STORE: Loaded ${transformedDiamonds.length} diamonds - SUPER FAST!`);
    } catch (err) {
      console.error('Error fetching enhanced store data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load diamonds');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  // Fast static description generation instead of OpenAI
  const generateStaticDescription = (item: any): string => {
    const shape = item.shape || item.Shape || 'Round';
    const weight = item.weight || item.Weight || item.carat || 1;
    const color = item.color || item.Color || 'D';
    const clarity = item.clarity || item.Clarity || 'VS1';
    const cut = item.cut || item.Cut || 'Excellent';
    const lab = item.lab || item.Lab || 'GIA';
    
    return `Stunning ${weight} carat ${shape} diamond with ${color} color and ${clarity} clarity. ${cut} cut grade certified by ${lab}. A beautiful choice for any jewelry collection.`;
  };

  const stats = {
    totalDiamonds: diamonds.length,
    availableDiamonds: diamonds.filter(d => d.status === 'Available').length,
    averagePrice: diamonds.length > 0 ? Math.round(diamonds.reduce((sum, d) => sum + d.price, 0) / diamonds.length) : 0
  };

  return {
    diamonds,
    loading,
    error,
    stats,
    refetch: fetchStoreData,
    refreshData: fetchStoreData
  };
}
