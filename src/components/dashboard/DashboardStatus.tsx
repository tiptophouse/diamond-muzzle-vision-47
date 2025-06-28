
import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatusProps {
  loading: boolean;
  error?: string | null;
  lastUpdate?: Date;
  totalDiamonds: number;
  onRefresh: () => void;
}

export function DashboardStatus({ 
  loading, 
  error, 
  lastUpdate, 
  totalDiamonds, 
  onRefresh 
}: DashboardStatusProps) {
  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Loading inventory data...';
    if (error) return `Error: ${error}`;
    return `Connected to FastAPI - ${totalDiamonds} diamonds loaded`;
  };

  const getStatusColor = () => {
    if (loading) return 'border-blue-200 bg-blue-50';
    if (error) return 'border-red-200 bg-red-50';
    return 'border-green-200 bg-green-50';
  };

  return (
    <Card className={`${getStatusColor()} transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium">{getStatusText()}</p>
              {lastUpdate && !loading && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
