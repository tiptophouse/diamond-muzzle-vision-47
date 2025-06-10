
import { useState, useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { BACKEND_CONFIG, getBackendHeaders, logApiCall } from '@/lib/config/backend';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useUnifiedInventory() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchFromBackend = async () => {
    try {
      setLoading(true);
      const userId = user?.id || 2138564172;
      const endpoint = `/api/v1/get_all_stones?user_id=${userId}`;
      
      logApiCall(endpoint, 'GET');
      
      const response = await fetch(`${BACKEND_CONFIG.API_URL}${endpoint}`, {
        method: 'GET',
        headers: getBackendHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Backend data loaded:', data?.length || 0, 'diamonds');
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Backend fetch failed:', error);
      throw error;
    }
  };

  const transformBackendData = (backendData: any[]): Diamond[] => {
    return backendData.map((item: any, index: number) => ({
      id: item.id || `backend-${index}`,
      stockNumber: item.stock_number || item.Stock || `STOCK-${index}`,
      shape: item.shape || item.Shape || 'Round',
      carat: Number(item.weight || item.Weight || item.carat || 1),
      color: item.color || item.Color || 'D',
      clarity: item.clarity || item.Clarity || 'VS1',
      cut: item.cut || item.Cut || 'Excellent',
      price: Number(item.price_per_carat || item['Price/Crt'] || item.price || 1000) * Number(item.weight || item.Weight || item.carat || 1),
      status: item.status || 'Available',
      imageUrl: item.picture || item.Pic || item.photo || undefined,
      additional_images: this.extractAdditionalImages(item),
      store_visible: item.store_visible ?? true,
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
  };

  const extractAdditionalImages = (item: any): string[] => {
    const images: string[] = [];
    if (item.picture2) images.push(item.picture2);
    if (item.picture3) images.push(item.picture3);
    if (item.picture4) images.push(item.picture4);
    if (item.image_gallery && Array.isArray(item.image_gallery)) {
      images.push(...item.image_gallery);
    }
    return images;
  };

  const loadAllInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      setSyncStatus('syncing');

      const backendData = await fetchFromBackend();
      const transformedDiamonds = transformBackendData(backendData);
      
      setDiamonds(transformedDiamonds);
      setSyncStatus('success');
      
      toast({
        title: "✅ Inventory Synchronized",
        description: `Loaded ${transformedDiamonds.length} diamonds from your backend`,
      });
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
      setSyncStatus('error');
      
      toast({
        variant: "destructive",
        title: "❌ Sync Failed",
        description: "Could not connect to your backend API",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDiamond = async (diamondData: Partial<Diamond>) => {
    try {
      logApiCall('/api/v1/upload-inventory', 'POST', diamondData);
      
      const response = await fetch(`${BACKEND_CONFIG.API_URL}/api/v1/upload-inventory`, {
        method: 'POST',
        headers: getBackendHeaders(),
        body: JSON.stringify({
          user_id: user?.id || 2138564172,
          diamonds: [diamondData]
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create diamond: ${response.status}`);
      }

      await triggerMakeWebhook('diamond_created', diamondData);
      await loadAllInventory(); // Refresh data
      
      toast({
        title: "💎 Diamond Created",
        description: `${diamondData.stockNumber} added to your inventory`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating diamond:', error);
      toast({
        variant: "destructive",
        title: "❌ Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create diamond",
      });
      return false;
    }
  };

  const triggerMakeWebhook = async (event: string, data: any) => {
    try {
      logApiCall('Make.com Webhook', 'POST', { event, data });
      
      await fetch(BACKEND_CONFIG.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          data
        }),
      });
      
      console.log('✅ Make.com webhook triggered:', event);
    } catch (error) {
      console.warn('⚠️ Webhook trigger failed:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadAllInventory();
    }
  }, [user?.id]);

  return {
    diamonds,
    loading,
    error,
    syncStatus,
    refreshInventory: loadAllInventory,
    createDiamond,
    triggerMakeWebhook,
    stats: {
      total: diamonds.length,
      available: diamonds.filter(d => d.status === 'Available').length,
      visible: diamonds.filter(d => d.store_visible).length,
    }
  };
}
