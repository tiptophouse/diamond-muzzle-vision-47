import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { api } from '@/lib/api/client';

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
    setLoading(true);
    setError(null);

    try {
      let diamonds: DiamondData[] = [];
      
      if (isAuthenticated && user?.id) {
        console.log('🔍 Fetching diamond distribution for authenticated user:', user.id);
        
        // Fetch diamonds from correct FastAPI endpoint
        const response = await api.get<any[]>(`/api/v1/get_all_stones?user_id=${user.id}`);
        
        if (response.data && Array.isArray(response.data)) {
          diamonds = response.data.map(d => ({
            id: d.id || d.stock_number || '',
            shape: d.shape || 'Round',
            color: d.color || 'H',
            clarity: d.clarity || 'VS1',
            carat: Number(d.weight || d.carat || 1),
            price: Number(d.price_per_carat || d.price || 0),
            certificate_number: String(d.certificate_number || ''),
            created_at: d.created_at || new Date().toISOString()
          }));
        }
        
        console.log('📊 Received diamonds for distribution:', diamonds.length);
      } else {
        console.log('🔍 Not authenticated, using demo data for diamond distribution');
        // Provide demo data for better UX
        diamonds = [
          { id: '1', shape: 'Round', color: 'D', clarity: 'FL', carat: 2.5, price: 15000, certificate_number: '12345', created_at: new Date().toISOString() },
          { id: '2', shape: 'Princess', color: 'E', clarity: 'VVS1', carat: 1.8, price: 12000, certificate_number: '12346', created_at: new Date().toISOString() },
          { id: '3', shape: 'Emerald', color: 'F', clarity: 'VVS2', carat: 3.2, price: 18000, certificate_number: '12347', created_at: new Date().toISOString() },
          { id: '4', shape: 'Round', color: 'G', clarity: 'VS1', carat: 1.5, price: 8000, certificate_number: '12348', created_at: new Date().toISOString() },
          { id: '5', shape: 'Oval', color: 'H', clarity: 'VS2', carat: 2.1, price: 11000, certificate_number: '12349', created_at: new Date().toISOString() },
          { id: '6', shape: 'Cushion', color: 'I', clarity: 'SI1', carat: 1.9, price: 9500, certificate_number: '12350', created_at: new Date().toISOString() },
          { id: '7', shape: 'Pear', color: 'J', clarity: 'SI2', carat: 2.3, price: 10500, certificate_number: '12351', created_at: new Date().toISOString() },
          { id: '8', shape: 'Marquise', color: 'K', clarity: 'I1', carat: 1.7, price: 7500, certificate_number: '12352', created_at: new Date().toISOString() }
        ];
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
    // Always fetch data, regardless of authentication status for better UX
    fetchDistributionData();
  }, [user?.id, isAuthenticated]);

  return {
    data,
    loading,
    error,
    refetch: fetchDistributionData
  };
}