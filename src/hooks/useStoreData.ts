
import { useState, useEffect, useCallback } from 'react';
import { secureApiClient } from '@/lib/api/secureClient';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';

export interface StoreDiamond {
  id: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  imageUrl?: string;
  certificateUrl?: string;
  store_visible: boolean;
  status: string; // Add this required field
  lab?: string;
  certificateNumber?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  gem360Url?: string;
  length?: number;
  width?: number;
  depth?: number;
  ratio?: number;
  tablePercentage?: number;
  depthPercentage?: number;
  gridle?: string;
  culet?: string;
}

export function useStoreData() {
  const [diamonds, setDiamonds] = useState<StoreDiamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useTelegramAuth();

  const fetchStoreData = useCallback(async () => {
    if (!isAuthenticated || !secureApiClient.isAuthenticated()) {
      console.log('🏪 STORE: Not authenticated, cannot fetch store data');
      setLoading(false);
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🏪 STORE: Fetching diamonds using secure API client...');
      
      const response = await secureApiClient.get('/api/v1/get_all_stones');
      
      if (response.success && response.data) {
        let diamondArray: any[] = [];
        
        if (Array.isArray(response.data)) {
          diamondArray = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          const dataObj = response.data as Record<string, any>;
          const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results'];
          
          for (const key of possibleArrayKeys) {
            if (Array.isArray(dataObj[key])) {
              diamondArray = dataObj[key];
              break;
            }
          }
        }
        
        // Filter only store-visible diamonds and transform data
        const storeVisibleDiamonds = diamondArray
          .filter(item => item.store_visible !== false)
          .map(item => ({
            id: item.id || item.stock || item.stock_number,
            stockNumber: item.stock || item.stock_number || item.stockNumber,
            shape: item.shape || 'Round',
            carat: parseFloat(item.weight || item.carat || 0),
            color: item.color || 'D',
            clarity: item.clarity || 'FL',
            cut: item.cut || 'Excellent',
            price: Number(item.price_per_carat ? 
              item.price_per_carat * (item.weight || item.carat) : 
              item.price || 0),
            imageUrl: item.picture || item.image_url || item.imageUrl,
            certificateUrl: item.certificate_url || item.certificateUrl,
            store_visible: item.store_visible !== false,
            status: item.status || 'available', // Add default status
            lab: item.lab,
            certificateNumber: item.certificate_number?.toString(),
            polish: item.polish,
            symmetry: item.symmetry,
            fluorescence: item.fluorescence,
            gem360Url: item.gem360Url || item.video_url || item.v360_url,
            length: item.length ? Number(item.length) : undefined,
            width: item.width ? Number(item.width) : undefined,
            depth: item.depth ? Number(item.depth) : undefined,
            ratio: item.ratio ? Number(item.ratio) : undefined,
            tablePercentage: item.table ? Number(item.table) : undefined,
            depthPercentage: item.depth_percentage ? Number(item.depth_percentage) : undefined,
            gridle: item.gridle,
            culet: item.culet,
          }));
        
        console.log('✅ STORE: Loaded', storeVisibleDiamonds.length, 'store-visible diamonds');
        setDiamonds(storeVisibleDiamonds);
        
      } else {
        console.error('❌ STORE: Failed to fetch diamonds:', response.error);
        setError(response.error || 'Failed to load store data');
        
        // Fallback to localStorage
        console.log('🔄 STORE: Trying localStorage fallback...');
        const localData = localStorage.getItem('diamond_inventory');
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            const userDiamonds = parsedData
              .filter((item: any) => item.store_visible !== false)
              .map((item: any) => ({
                id: item.id || item.stockNumber,
                stockNumber: item.stockNumber || item.stock,
                shape: item.shape || 'Round',
                carat: parseFloat(item.carat || 0),
                color: item.color || 'D',
                clarity: item.clarity || 'FL',
                cut: item.cut || 'Excellent',
                price: Number(item.price || 0),
                imageUrl: item.imageUrl || item.picture,
                certificateUrl: item.certificateUrl,
                store_visible: true,
                status: item.status || 'available', // Add default status
                lab: item.lab,
                certificateNumber: item.certificateNumber,
                polish: item.polish,
                symmetry: item.symmetry,
                fluorescence: item.fluorescence,
              }));
            
            setDiamonds(userDiamonds);
            console.log('✅ STORE: Loaded', userDiamonds.length, 'diamonds from localStorage');
          } catch (parseError) {
            console.error('❌ STORE: Failed to parse localStorage:', parseError);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ STORE: Error fetching store data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load store data';
      setError(errorMessage);
      
      toast.error('Store Loading Error', {
        description: 'Failed to load diamonds from server'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  const refetch = useCallback(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  return {
    diamonds,
    loading,
    error,
    refetch,
  };
}
