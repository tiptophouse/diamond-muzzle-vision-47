import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gem } from 'lucide-react';

export function AvailableDiamondsCounter() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiamondCount = async () => {
      try {
        const { count: diamondCount, error } = await supabase
          .from('inventory')
          .select('*', { count: 'exact', head: true })
          .eq('store_visible', true)
          .is('deleted_at', null);

        if (error) {
          console.error('Error fetching diamond count:', error);
        } else {
          setCount(diamondCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch diamond count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiamondCount();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Gem className="h-4 w-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Gem className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">
        {count.toLocaleString()} diamonds available
      </span>
    </div>
  );
}