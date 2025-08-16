
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface ShapeGroupData {
  shape: string;
  count: number;
  totalPrice: number;
  avgPrice: number;
  totalCarat: number;
  avgCarat: number;
}

interface InsightsData {
  totalInventory: number;
  totalValue: number;
  avgPricePerCarat: number;
  totalCarat: number;
  shapeDistribution: ShapeGroupData[];
  colorDistribution: Array<{ color: string; count: number; percentage: number }>;
  clarityDistribution: Array<{ clarity: string; count: number; percentage: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  priceRanges: Array<{ range: string; count: number; percentage: number }>;
  topShapes: Array<{ shape: string; count: number; value: number }>;
  profitability: {
    highestValue: { shape: string; value: number };
    mostPopular: { shape: string; count: number };
    bestMargin: { shape: string; margin: number };
  };
}

export function useEnhancedInsights() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const calculateInsights = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Set user context for RLS
      await supabase.rpc('set_session_context', {
        key: 'app.current_user_id',
        value: user.id.toString()
      });

      // Fetch inventory data
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (inventoryError) throw inventoryError;

      if (!inventory || inventory.length === 0) {
        setInsights({
          totalInventory: 0,
          totalValue: 0,
          avgPricePerCarat: 0,
          totalCarat: 0,
          shapeDistribution: [],
          colorDistribution: [],
          clarityDistribution: [],
          statusDistribution: [],
          priceRanges: [],
          topShapes: [],
          profitability: {
            highestValue: { shape: 'N/A', value: 0 },
            mostPopular: { shape: 'N/A', count: 0 },
            bestMargin: { shape: 'N/A', margin: 0 }
          }
        });
        return;
      }

      // Calculate basic metrics
      const totalInventory = inventory.length;
      const totalValue = inventory.reduce((sum, item) => sum + ((item.price_per_carat || 0) * (item.weight || 0)), 0);
      const totalCarat = inventory.reduce((sum, item) => sum + (item.weight || 0), 0);
      const avgPricePerCarat = totalCarat > 0 ? totalValue / totalCarat : 0;

      // Group by shape for distribution analysis
      const shapeGroups = inventory.reduce((groups, item) => {
        const shape = item.shape || 'Unknown';
        if (!groups[shape]) {
          groups[shape] = { items: [], totalPrice: 0, totalCarat: 0 };
        }
        groups[shape].items.push(item);
        groups[shape].totalPrice += (item.price_per_carat || 0) * (item.weight || 0);
        groups[shape].totalCarat += item.weight || 0;
        return groups;
      }, {} as Record<string, { items: any[]; totalPrice: number; totalCarat: number }>);

      // Convert to array format with proper typing
      const shapeDistribution: ShapeGroupData[] = Object.entries(shapeGroups).map(([shape, data]) => ({
        shape,
        count: data.items.length,
        totalPrice: data.totalPrice,
        avgPrice: data.items.length > 0 ? data.totalPrice / data.items.length : 0,
        totalCarat: data.totalCarat,
        avgCarat: data.items.length > 0 ? data.totalCarat / data.items.length : 0
      }));

      // Calculate color distribution
      const colorGroups = inventory.reduce((groups, item) => {
        const color = item.color || 'Unknown';
        groups[color] = (groups[color] || 0) + 1;
        return groups;
      }, {} as Record<string, number>);

      const colorDistribution = Object.entries(colorGroups).map(([color, count]) => ({
        color,
        count,
        percentage: (count / totalInventory) * 100
      }));

      // Calculate clarity distribution
      const clarityGroups = inventory.reduce((groups, item) => {
        const clarity = item.clarity || 'Unknown';
        groups[clarity] = (groups[clarity] || 0) + 1;
        return groups;
      }, {} as Record<string, number>);

      const clarityDistribution = Object.entries(clarityGroups).map(([clarity, count]) => ({
        clarity,
        count,
        percentage: (count / totalInventory) * 100
      }));

      // Calculate status distribution
      const statusGroups = inventory.reduce((groups, item) => {
        const status = item.status || 'Available';
        groups[status] = (groups[status] || 0) + 1;
        return groups;
      }, {} as Record<string, number>);

      const statusDistribution = Object.entries(statusGroups).map(([status, count]) => ({
        status,
        count,
        percentage: (count / totalInventory) * 100
      }));

      // Calculate price ranges
      const priceRangeGroups = inventory.reduce((groups, item) => {
        const totalPrice = (item.price_per_carat || 0) * (item.weight || 0);
        let range = 'Unknown';
        
        if (totalPrice < 1000) range = '$0-$1,000';
        else if (totalPrice < 5000) range = '$1,000-$5,000';
        else if (totalPrice < 10000) range = '$5,000-$10,000';
        else if (totalPrice < 25000) range = '$10,000-$25,000';
        else range = '$25,000+';
        
        groups[range] = (groups[range] || 0) + 1;
        return groups;
      }, {} as Record<string, number>);

      const priceRanges = Object.entries(priceRangeGroups).map(([range, count]) => ({
        range,
        count,
        percentage: (count / totalInventory) * 100
      }));

      // Calculate top shapes by value and count
      const topShapes = shapeDistribution
        .sort((a, b) => b.totalPrice - a.totalPrice)
        .slice(0, 5)
        .map(shape => ({
          shape: shape.shape,
          count: shape.count,
          value: shape.totalPrice
        }));

      // Calculate profitability insights
      const highestValueShape = shapeDistribution.reduce((max, shape) => 
        shape.totalPrice > max.totalPrice ? shape : max, shapeDistribution[0] || { shape: 'N/A', totalPrice: 0 });
      
      const mostPopularShape = shapeDistribution.reduce((max, shape) => 
        shape.count > max.count ? shape : max, shapeDistribution[0] || { shape: 'N/A', count: 0 });

      const profitability = {
        highestValue: { shape: highestValueShape?.shape || 'N/A', value: highestValueShape?.totalPrice || 0 },
        mostPopular: { shape: mostPopularShape?.shape || 'N/A', count: mostPopularShape?.count || 0 },
        bestMargin: { shape: 'Round', margin: 15.5 } // This could be calculated based on market data
      };

      setInsights({
        totalInventory,
        totalValue,
        avgPricePerCarat,
        totalCarat,
        shapeDistribution,
        colorDistribution,
        clarityDistribution,
        statusDistribution,
        priceRanges,
        topShapes,
        profitability
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate insights';
      setError(errorMessage);
      console.error('Error calculating insights:', err);
      
      toast({
        title: "Error calculating insights",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      calculateInsights();
    }
  }, [user?.id]);

  return {
    insights,
    loading,
    error,
    refetch: calculateInsights
  };
}
