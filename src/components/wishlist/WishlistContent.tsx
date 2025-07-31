
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Bell, BellOff, Plus, Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { CreateWishlistAlert } from './CreateWishlistAlert';

interface WishlistItem {
  id: string;
  diamond_stock_number: string;
  diamond_data: any;
  created_at: string;
}

interface WishlistAlert {
  id: string;
  shape?: string;
  min_carat?: number;
  max_carat?: number;
  colors: string[];
  clarities: string[];
  cuts: string[];
  polish: string[];
  symmetry: string[];
  max_price_per_carat?: number;
  is_active: boolean;
  alert_name?: string;
  created_at: string;
}

export function WishlistContent() {
  const { user } = useTelegramAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistAlerts, setWishlistAlerts] = useState<WishlistAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateAlert, setShowCreateAlert] = useState(false);

  const fetchWishlistData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Fetch wishlist items
      const { data: items, error: itemsError } = await supabase
        .from('wishlist')
        .select('*')
        .eq('visitor_telegram_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // TODO: Create wishlist_alerts table
      // const { data: alerts, error: alertsError } = await supabase
      //   .from('wishlist_alerts')
      //   .select('*')
      //   .eq('telegram_id', user.id)
      //   .order('created_at', { ascending: false });

      // if (alertsError) throw alertsError;

      setWishlistItems(items || []);
      setWishlistAlerts([]);
    } catch (error) {
      console.error('Error fetching wishlist data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת נתוני רשימת המשאלות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, [user?.id]);

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(items => items.filter(item => item.id !== itemId));
      toast({
        title: "הצלחה",
        description: "היהלום הוסר מרשימת המשאלות",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהסרת היהלום מרשימת המשאלות",
        variant: "destructive",
      });
    }
  };

  const toggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      // TODO: Create wishlist_alerts table
      // const { error } = await supabase
      //   .from('wishlist_alerts')
      //   .update({ is_active: !currentStatus })
      //   .eq('id', alertId);

      // if (error) throw error;

      setWishlistAlerts(alerts => 
        alerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_active: !currentStatus }
            : alert
        )
      );

      toast({
        title: "הצלחה",
        description: currentStatus ? "התראה בוטלה" : "התראה הופעלה",
      });
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון ההתראה",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      // TODO: Create wishlist_alerts table
      // const { error } = await supabase
      //   .from('wishlist_alerts')
      //   .delete()
      //   .eq('id', alertId);

      // if (error) throw error;

      setWishlistAlerts(alerts => alerts.filter(alert => alert.id !== alertId));
      toast({
        title: "הצלחה",
        description: "התראה נמחקה בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת התראה",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">טוען רשימת משאלות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">רשימת המשאלות שלי</h1>
        <p className="text-muted-foreground">
          נהל את היהלומים המועדפים עליך והגדר התראות מחיר אוטומטיות
        </p>
      </div>

      {/* Create Alert Button */}
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">צור התראת מחיר מותאמת אישית</h3>
              <p className="text-muted-foreground mb-4">
                הגדר קריטריונים מדויקים וקבל הודעות טלגרם אוטומטיות כשיהלומים מתאימים זמינים במחיר שמתאים לך
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateAlert(true)}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Plus className="w-5 h-5 mr-2" />
              צור התראת מחיר חדשה
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Alerts */}
      {wishlistAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              התראות המחיר שלי ({wishlistAlerts.length})
            </CardTitle>
            <CardDescription>
              נהל את ההתראות האוטומטיות שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wishlistAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.alert_name || 'התראה ללא שם'}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {alert.shape && <Badge variant="outline">צורה: {alert.shape}</Badge>}
                        {alert.min_carat && <Badge variant="outline">מ-{alert.min_carat} קראט</Badge>}
                        {alert.max_carat && <Badge variant="outline">עד {alert.max_carat} קראט</Badge>}
                        {alert.max_price_per_carat && <Badge variant="outline">עד ${alert.max_price_per_carat}/קראט</Badge>}
                        {alert.colors.length > 0 && <Badge variant="outline">צבעים: {alert.colors.join(', ')}</Badge>}
                        {alert.clarities.length > 0 && <Badge variant="outline">בהירות: {alert.clarities.join(', ')}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAlert(alert.id, alert.is_active)}
                        className={alert.is_active ? "text-green-600" : "text-gray-400"}
                      >
                        {alert.is_active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Diamonds */}
      {wishlistItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>יהלומים שמורים ({wishlistItems.length})</CardTitle>
            <CardDescription>
              יהלומים שהוספת לרשימת המשאלות שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {wishlistItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="font-medium">יהלום #{item.diamond_stock_number}</h4>
                      {item.diamond_data && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{item.diamond_data.shape} - {item.diamond_data.weight} קראט</div>
                          <div>{item.diamond_data.color} / {item.diamond_data.clarity}</div>
                          <div>${item.diamond_data.price_per_carat}/קראט</div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 && wishlistAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">רשימת המשאלות ריקה</h3>
                <p className="text-muted-foreground">
                  התחל בצירת התראות מחיר מותאמות אישית או הוסף יהלומים לרשימת המשאלות
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Alert Modal */}
      <CreateWishlistAlert
        isOpen={showCreateAlert}
        onClose={() => setShowCreateAlert(false)}
        onSuccess={() => {
          fetchWishlistData();
          setShowCreateAlert(false);
        }}
      />
    </div>
  );
}
