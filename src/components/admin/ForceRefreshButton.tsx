
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useForceDataRefresh } from '@/hooks/useForceDataRefresh';

export function ForceRefreshButton() {
  const { forceRefreshAllData } = useForceDataRefresh();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceRefreshAllData();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Force Refresh Data'}
    </Button>
  );
}
