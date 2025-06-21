
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminActionsProps {
  onRefetch: () => void;
}

export function AdminActions({ onRefetch }: AdminActionsProps) {
  const { toast } = useToast();

  const deleteMockData = async () => {
    if (window.confirm('Are you sure you want to delete ALL mock/test data? This will remove users with names like "Test", "Telegram", "Emergency", etc.')) {
      try {
        console.log('Deleting all mock data...');
        
        // Delete mock users from analytics first
        const { error: analyticsError } = await supabase
          .from('user_analytics')
          .delete()
          .in('telegram_id', [2138564172, 1000000000]); // Known mock IDs

        // Delete mock users where first_name indicates test data
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .or('first_name.ilike.%test%,first_name.ilike.%telegram%,first_name.ilike.%emergency%,first_name.ilike.%unknown%');

        if (profileError) {
          throw profileError;
        }

        toast({
          title: "Mock Data Deleted",
          description: "All mock/test data has been removed",
        });

        onRefetch();
      } catch (error: any) {
        console.error('Error deleting mock data:', error);
        toast({
          title: "Error",
          description: "Failed to delete mock data",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex gap-4 mb-6">
      <Button
        onClick={deleteMockData}
        variant="destructive"
        className="px-4 py-2"
      >
        Delete All Mock Data
      </Button>
    </div>
  );
}
