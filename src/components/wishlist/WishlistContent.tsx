
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateWishlistAlert } from './CreateWishlistAlert';
import { Bell, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WishlistAlert {
  id: string;
  telegram_id: number;
  shape?: string;
  min_carat?: number;
  max_carat?: number;
  colors?: string[];
  clarities?: string[];
  cuts?: string[];
  polish?: string[];
  symmetry?: string[];
  max_price_per_carat?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function WishlistContent() {
  const [alerts, setAlerts] = useState<WishlistAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // For now, using mock data until the SQL migration is approved
      const mockAlerts: WishlistAlert[] = [
        {
          id: '1',
          telegram_id: 123456789,
          shape: 'Round',
          min_carat: 1.0,
          max_carat: 2.0,
          colors: ['D', 'E', 'F'],
          clarities: ['FL', 'IF', 'VVS1'],
          cuts: ['Excellent'],
          polish: ['Excellent'],
          symmetry: ['Excellent'],
          max_price_per_carat: 8000,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setAlerts(mockAlerts);
      
    } catch (error) {
      console.error('Error fetching wishlist alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      // Once SQL migration is approved, implement actual deletion
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Alert Deleted",
        description: "Wishlist alert has been removed",
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_active: !alert.is_active }
          : alert
      ));
      
      toast({
        title: "Alert Updated",
        description: "Alert status has been changed",
      });
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error", 
        description: "Failed to update alert",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wishlist Alerts</h2>
          <p className="text-muted-foreground">Get notified when diamonds matching your criteria become available</p>
        </div>
        <CreateWishlistAlert onAlertCreated={fetchAlerts} />
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No alerts yet</h3>
              <p className="text-muted-foreground mb-4">Create your first alert to get notified about matching diamonds</p>
              <CreateWishlistAlert onAlertCreated={fetchAlerts} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`${alert.is_active ? '' : 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {alert.shape || 'Any Shape'} Diamond Alert
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.is_active ? "default" : "secondary"}>
                      {alert.is_active ? "Active" : "Paused"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAlert(alert.id)}
                    >
                      {alert.is_active ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Carat:</span>
                    <span>{alert.min_carat} - {alert.max_carat} ct</span>
                  </div>
                  {alert.colors && alert.colors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Colors:</span>
                      <div className="flex gap-1">
                        {alert.colors.map(color => (
                          <Badge key={color} variant="outline" className="text-xs">{color}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {alert.clarities && alert.clarities.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Clarities:</span>
                      <div className="flex gap-1">
                        {alert.clarities.map(clarity => (
                          <Badge key={clarity} variant="outline" className="text-xs">{clarity}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Max Price:</span>
                    <span>${alert.max_price_per_carat?.toLocaleString()}/ct</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(alert.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
