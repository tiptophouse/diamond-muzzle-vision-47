import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function FloatingDiamondsCounter() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

    // Set up real-time updates
    const channel = supabase
      .channel('inventory-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        () => {
          fetchDiamondCount(); // Refetch count when inventory changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClick = () => {
    navigate('/store');
  };

  if (isLoading) {
    return (
      <Button
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-primary to-primary-dark hover:scale-110 transition-all duration-300"
        onClick={handleClick}
      >
        <Gem className="h-6 w-6 animate-pulse text-white" />
      </Button>
    );
  }

  return (
    <Button
      className="fixed bottom-6 right-6 z-50 h-14 px-4 rounded-full shadow-2xl bg-gradient-to-r from-primary to-primary-dark hover:scale-110 transition-all duration-300 flex items-center gap-2"
      onClick={handleClick}
      title={`${count.toLocaleString()} diamonds available - Click to browse`}
    >
      <Gem className="h-5 w-5 text-white" />
      <span className="text-white font-bold text-sm min-w-[2rem]">
        {count > 999 ? `${Math.floor(count / 1000)}k` : count}
      </span>
    </Button>
  );
}