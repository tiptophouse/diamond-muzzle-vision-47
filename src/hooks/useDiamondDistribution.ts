import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { http } from '@/api/http';

interface DiamondData {
  id: string;
  shape: string;
  color: string;
  clarity: string;
  carat: number;
  price: number;
  certificate_number: string;
  created_at: string;
}

interface ColorDistribution {
  color: string;
  count: number;
  percentage: number;
  totalValue: number;
}

interface ClarityDistribution {
  clarity: string;
  count: number;
  percentage: number;
  totalValue: number;
}

interface DistributionData {
  colorDistribution: ColorDistribution[];
  clarityDistribution: ClarityDistribution[];
  totalDiamonds: number;
  recentDiamonds: DiamondData[];
}

export function useDiamondDistribution() {
  const [data, setData] = useState<DistributionData>({
    colorDistribution: [],
    clarityDistribution: [],
    totalDiamonds: 0,
    recentDiamonds: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();

  const fetchDistributionData = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('Not authenticated, skipping diamond distribution fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching diamond distribution for user:', user.id);
      
      // Fetch diamonds from FastAPI
      const response = await http<{ results: DiamondData[]; total: number }>(`/api/v1/get_search_results?user_id=${user.id}&limit=1000&offset=0`);
      
      const diamonds = response.results || [];
      console.log('📊 Received diamonds for distribution:', diamonds.length);

      if (diamonds.length === 0) {
        setData({
          colorDistribution: [],
          clarityDistribution: [],
          totalDiamonds: 0,
          recentDiamonds: []
        });
        return;
      }

      // Calculate color distribution
      const colorCounts = diamonds.reduce((acc, diamond) => {
        const color = diamond.color || 'Unknown';
        if (!acc[color]) {
          acc[color] = { count: 0, totalValue: 0 };
        }
        acc[color].count += 1;
        acc[color].totalValue += diamond.price || 0;
        return acc;
      }, {} as Record<string, { count: number; totalValue: number }>);

      const colorDistribution = Object.entries(colorCounts)
        .map(([color, data]) => ({
          color,
          count: data.count,
          totalValue: data.totalValue,
          percentage: (data.count / diamonds.length) * 100
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate clarity distribution
      const clarityCounts = diamonds.reduce((acc, diamond) => {
        const clarity = diamond.clarity || 'Unknown';
        if (!acc[clarity]) {
          acc[clarity] = { count: 0, totalValue: 0 };
        }
        acc[clarity].count += 1;
        acc[clarity].totalValue += diamond.price || 0;
        return acc;
      }, {} as Record<string, { count: number; totalValue: number }>);

      const clarityDistribution = Object.entries(clarityCounts)
        .map(([clarity, data]) => ({
          clarity,
          count: data.count,
          totalValue: data.totalValue,
          percentage: (data.count / diamonds.length) * 100
        }))
        .sort((a, b) => b.count - a.count);

      // Get recent diamonds (last 10)
      const recentDiamonds = diamonds
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setData({
        colorDistribution,
        clarityDistribution,
        totalDiamonds: diamonds.length,
        recentDiamonds
      });

      console.log('📊 Distribution calculated:', {
        colors: colorDistribution.length,
        clarities: clarityDistribution.length,
        total: diamonds.length
      });

    } catch (error) {
      console.error('❌ Failed to fetch diamond distribution:', error);
      setError('Failed to load diamond distribution data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributionData();
  }, [user?.id, isAuthenticated]);

  return {
    data,
    loading,
    error,
    refetch: fetchDistributionData
  };
}