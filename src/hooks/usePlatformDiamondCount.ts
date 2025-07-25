
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DiamondCountCache {
  count: number;
  lastUpdated: Date;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'platform_diamond_count';

export function usePlatformDiamondCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedCount = (): DiamondCountCache | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: DiamondCountCache = JSON.parse(cached);
        const now = Date.now();
        const cacheAge = now - new Date(data.lastUpdated).getTime();
        
        if (cacheAge < CACHE_DURATION) {
          console.log('📊 Using cached diamond count:', data.count);
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to read cached diamond count:', error);
    }
    return null;
  };

  const setCachedCount = (count: number) => {
    try {
      const cacheData: DiamondCountCache = {
        count,
        lastUpdated: new Date()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('📊 Cached diamond count:', count);
    } catch (error) {
      console.warn('Failed to cache diamond count:', error);
    }
  };

  const fetchDiamondCount = async () => {
    try {
      console.log('📊 Fetching fresh diamond count from database...');
      
      // Use the existing Supabase function for public diamond count
      const { data, error } = await supabase.rpc('get_public_diamond_count');
      
      if (error) {
        throw error;
      }

      const totalCount = data || 0;
      setCount(totalCount);
      setCachedCount(totalCount);
      setError(null);
      
      console.log('📊 Fresh diamond count fetched:', totalCount);
    } catch (err) {
      console.error('❌ Error fetching diamond count:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch diamond count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check cache first
    const cached = getCachedCount();
    if (cached) {
      setCount(cached.count);
      setLoading(false);
      return;
    }

    // If no cache, fetch fresh data
    fetchDiamondCount();
  }, []);

  const refreshCount = () => {
    setLoading(true);
    fetchDiamondCount();
  };

  return {
    count,
    loading,
    error,
    refreshCount
  };
}
