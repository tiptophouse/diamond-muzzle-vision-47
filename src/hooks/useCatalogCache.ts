import { useCallback } from 'react';
import { useTelegramCloudCache } from './useTelegramCloudCache';
import { Diamond } from '@/components/inventory/InventoryTable';
import { logger } from '@/utils/logger';

const CACHE_KEY = 'catalog_diamonds_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useCatalogCache() {
  const { save, load, remove } = useTelegramCloudCache<Diamond[]>(CACHE_KEY, {
    ttl: CACHE_TTL,
    compression: true
  });

  const saveDiamonds = useCallback(async (diamonds: Diamond[]) => {
    try {
      await save(diamonds);
      logger.perf('Catalog cached to Telegram storage', {
        count: diamonds.length,
        size: `${Math.round(JSON.stringify(diamonds).length / 1024)}KB`
      });
      return true;
    } catch (error) {
      logger.error('Failed to cache catalog:', error);
      return false;
    }
  }, [save]);

  const loadDiamonds = useCallback(async (): Promise<Diamond[] | null> => {
    try {
      const cached = await load();
      if (cached) {
        logger.perf('Catalog loaded from Telegram cache', {
          count: cached.length
        });
      }
      return cached;
    } catch (error) {
      logger.error('Failed to load cached catalog:', error);
      return null;
    }
  }, [load]);

  const clearCache = useCallback(async () => {
    try {
      await remove();
      logger.perf('Catalog cache cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear catalog cache:', error);
      return false;
    }
  }, [remove]);

  return {
    saveDiamonds,
    loadDiamonds,
    clearCache
  };
}
