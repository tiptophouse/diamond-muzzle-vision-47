
import { useState, useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { fetchInventoryData } from '@/services/inventoryDataService';

export function useReportsData() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchInventoryData();

      if (result.error) {
        setError(result.error);
        setDiamonds([]);
        setAllDiamonds([]);
        return;
      }

      if (result.data && result.data.length > 0) {
        // Transform data to match Diamond interface
        const transformedDiamonds: Diamond[] = result.data.map(item => ({
          id: item.id || `${item.stock || item.stock_number || item.VendorStockNumber}-${Date.now()}`,
          diamondId: item.id || item.diamond_id,
          stockNumber: item.stock || item.stock_number || item.stockNumber || item.VendorStockNumber || '',
          shape: item.shape || item.Shape || 'Round',
          carat: parseFloat((item.weight || item.carat || item.Weight || 0).toString()) || 0,
          color: (item.color || item.Color || 'D').toUpperCase(),
          clarity: (item.clarity || item.Clarity || 'FL').toUpperCase(),
          cut: item.cut || item.Cut || item.Make || 'Excellent',
          price: Number(
            item.price_per_carat ? 
              item.price_per_carat * (item.weight || item.carat || item.Weight) : 
              item.price || item.Price || item.RapnetAskingPrice || item.IndexAskingPrice || 0
          ) || 0,
          status: item.status || item.Availability || 'Available',
          fluorescence: item.fluorescence || item.FluorescenceIntensity || undefined,
          imageUrl: item.picture || 
                   item.imageUrl || 
                   item.Image || 
                   item.image ||
                   undefined,
          gem360Url: item.gem360Url || 
                     item['Video link'] || 
                     item.videoLink ||
                     undefined,
          store_visible: item.store_visible !== false, // Default to true
          certificateNumber: item.certificate_number || 
                           item.certificateNumber || 
                           item.CertificateID || 
                           undefined,
          lab: item.lab || item.Lab || undefined,
          certificateUrl: item.certificate_url || item.certificateUrl || undefined,
          // Add CSV-specific fields
          Image: item.Image,
          image: item.image,
          picture: item.picture,
          'Video link': item['Video link'],
          videoLink: item.videoLink,
        }));
        
        setDiamonds(transformedDiamonds);
        setAllDiamonds(transformedDiamonds);
      } else {
        setDiamonds([]);
        setAllDiamonds([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports data';
      setError(errorMessage);
      setDiamonds([]);
      setAllDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    diamonds,
    allDiamonds,
    loading,
    error,
    refetch: fetchData,
  };
}
