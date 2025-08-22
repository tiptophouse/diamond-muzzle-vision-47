
import { useState, useEffect, useMemo } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { Diamond } from '@/types/diamond';

interface MarketData {
  count: number;
  prices: number[];
}

export function usePriceComparison(diamond: Diamond) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!diamond.shape || !diamond.carat || !diamond.color || !diamond.clarity) {
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(apiEndpoints.getMarketComparison({
          shape: diamond.shape,
          carat_min: diamond.carat * 0.9,
          carat_max: diamond.carat * 1.1,
          color: diamond.color,
          clarity: diamond.clarity
        }));

        if (response.data) {
          const data = response.data as any;
          setMarketData({
            count: data.count || 0,
            prices: data.prices || []
          });
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [diamond.shape, diamond.carat, diamond.color, diamond.clarity]);

  const analysis = useMemo(() => {
    if (!marketData || !marketData.prices.length || !diamond.price) {
      return null;
    }

    const prices = marketData.prices;
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    
    return {
      marketCount: marketData.count,
      averagePrice: avgPrice,
      medianPrice,
      yourPrice: diamond.price,
      percentageDiff: ((diamond.price - avgPrice) / avgPrice) * 100,
      isCompetitive: diamond.price <= avgPrice * 1.1
    };
  }, [marketData, diamond.price]);

  return {
    analysis,
    loading
  };
}
