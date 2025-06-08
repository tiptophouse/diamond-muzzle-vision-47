
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StoreFilters } from '@/pages/StorePage';

export function useStoreData(filters: StoreFilters, sortBy: string) {
  const [diamonds, setDiamonds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('inventory')
          .select('*')
          .eq('store_visible', true);

        // Apply shape filter
        if (filters.shape.length > 0) {
          query = query.in('shape', filters.shape);
        }

        // Apply color filter
        if (filters.color[0] !== 'D' || filters.color[1] !== 'Z') {
          // For color filtering, we need to handle the range properly
          // This is a simplified version - you might want to create a proper color ordering
          query = query.gte('color', filters.color[0]).lte('color', filters.color[1]);
        }

        // Apply clarity filter
        if (filters.clarity.length > 0) {
          query = query.in('clarity', filters.clarity);
        }

        // Apply carat range filter
        query = query.gte('weight', filters.carat[0]).lte('weight', filters.carat[1]);

        // Apply price range filter (assuming we have a calculated price)
        // For now, we'll use price_per_carat * weight as price
        query = query.gte('price_per_carat', Math.floor(filters.price[0] / 5));
        query = query.lte('price_per_carat', Math.ceil(filters.price[1] / 5));

        // Apply cut filter
        if (filters.cut.length > 0) {
          query = query.in('cut', filters.cut);
        }

        // Apply search filter
        if (filters.search) {
          query = query.or(`stock_number.ilike.%${filters.search}%,shape.ilike.%${filters.search}%,color.ilike.%${filters.search}%`);
        }

        // Apply sorting
        switch (sortBy) {
          case 'price-asc':
            query = query.order('price_per_carat', { ascending: true });
            break;
          case 'price-desc':
            query = query.order('price_per_carat', { ascending: false });
            break;
          case 'carat-asc':
            query = query.order('weight', { ascending: true });
            break;
          case 'carat-desc':
            query = query.order('weight', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching store data:', error);
          setError('Failed to load diamonds');
          setDiamonds([]);
          return;
        }

        // Transform the data to match the expected format
        const transformedData = (data || []).map(item => ({
          id: item.id,
          stockNumber: item.stock_number,
          shape: item.shape,
          carat: item.weight,
          color: item.color,
          clarity: item.clarity,
          cut: item.cut || 'Excellent',
          price: (item.price_per_carat || 0) * item.weight,
          status: item.status || 'Available',
          imageUrl: item.picture,
          lab: item.lab || 'GIA',
          certificateNumber: item.certificate_number,
        }));

        setDiamonds(transformedData);
      } catch (err) {
        console.error('Unexpected error fetching store data:', err);
        setError('An unexpected error occurred');
        setDiamonds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [filters, sortBy]);

  return { diamonds, loading, error };
}
