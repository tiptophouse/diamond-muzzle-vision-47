import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Diamond, Users, Send, Gem, RefreshCw } from 'lucide-react';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { api } from '@/lib/api';

interface DiamondOption {
  id: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string;
  price_per_carat: number;
  picture?: string;
  gem360_url?: string;
}

export function BulkDiamondShare() {
  const { toast } = useToast();
  const { user } = useTelegramWebApp();
  const [isLoading, setIsLoading] = useState(false);
  const [diamonds, setDiamonds] = useState<DiamondOption[]>([]);
  const [selectedDiamond, setSelectedDiamond] = useState<string>('');
  const [loadingDiamonds, setLoadingDiamonds] = useState(true);
  const { userCounts, stats, loading: diamondCountsLoading } = useUserDiamondCounts();

  // Fetch user's diamonds for sharing
  useEffect(() => {
    const fetchUserDiamonds = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingDiamonds(true);
        const response = await api.get(`/api/v1/get_all_stones?user_id=${user.id}`);
        
        if (response.data && Array.isArray(response.data)) {
          const diamondData = response.data.map((d: any) => ({
            id: d.id || crypto.randomUUID(),
            stock_number: d.stock_number,
            shape: d.shape,
            weight: d.weight,
            color: d.color,
            clarity: d.clarity,
            cut: d.cut,
            price_per_carat: d.price_per_carat,
            picture: d.picture,
            gem360_url: d.gem360_url
          }));
          setDiamonds(diamondData);
          console.log(`📊 Loaded ${diamondData.length} diamonds for bulk sharing`);
        }
      } catch (error) {
        console.error('❌ Error fetching diamonds:', error);
        toast({
          title: "Error loading diamonds",
          description: "Could not load your diamond inventory",
          variant: "destructive",
        });
      } finally {
        setLoadingDiamonds(false);
      }
    };

    fetchUserDiamonds();
  }, [user?.id]);

  const getSelectedDiamondData = () => {
    return diamonds.find(d => d.id === selectedDiamond);
  };

  const sendDiamondToAll = async () => {
    const diamond = getSelectedDiamondData();
    if (!diamond || !user?.id) {
      toast({
        title: "Selection Required",
        description: "Please select a diamond to share",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const totalPrice = diamond.price_per_carat * diamond.weight;
      
      const diamondMessage = `💎 *${diamond.weight} ct ${diamond.shape} Diamond*

🎨 Color: ${diamond.color}
💎 Clarity: ${diamond.clarity}
✂️ Cut: ${diamond.cut}
💰 Price: $${totalPrice.toLocaleString()}
📦 Stock: ${diamond.stock_number}

✨ *Shared from our premium collection*
👤 Shared by: ${user.first_name || 'Diamond Seller'}

💡 Click the button below to view full details and connect with the seller!`;

      // Call our bulk message sender with diamond data
      const { data, error } = await supabase.functions.invoke('send-bulk-diamond-share', {
        body: {
          diamond: {
            id: diamond.id,
            stockNumber: diamond.stock_number,
            carat: diamond.weight,
            shape: diamond.shape,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: totalPrice,
            imageUrl: diamond.picture,
            gem360Url: diamond.gem360_url
          },
          message: diamondMessage,
          sharedBy: user.id,
          sharedByName: user.first_name || 'Diamond Seller',
          users: userCounts,
          testMode: false
        }
      });

      if (error) throw error;

      toast({
        title: "Diamond Shared Successfully! 💎",
        description: `Your ${diamond.weight}ct ${diamond.shape} diamond was sent to ${userCounts.length} users`,
      });

    } catch (error) {
      console.error('Error sharing diamond:', error);
      toast({
        title: "Sharing Failed",
        description: "Failed to share diamond. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    const diamond = getSelectedDiamondData();
    if (!diamond || !user?.id) {
      toast({
        title: "Selection Required",
        description: "Please select a diamond to test",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const totalPrice = diamond.price_per_carat * diamond.weight;
      
      const testMessage = `🧪 *Test Diamond Share*

💎 *${diamond.weight} ct ${diamond.shape} Diamond*

🎨 Color: ${diamond.color}
💎 Clarity: ${diamond.clarity}
✂️ Cut: ${diamond.cut}
💰 Price: $${totalPrice.toLocaleString()}
📦 Stock: ${diamond.stock_number}

✨ *This is a test message - would be sent to ${userCounts.length} users*`;

      const { data, error } = await supabase.functions.invoke('send-bulk-diamond-share', {
        body: {
          diamond: {
            id: diamond.id,
            stockNumber: diamond.stock_number,
            carat: diamond.weight,
            shape: diamond.shape,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: totalPrice,
            imageUrl: diamond.picture,
            gem360Url: diamond.gem360_url
          },
          message: testMessage,
          sharedBy: user.id,
          sharedByName: user.first_name || 'Diamond Seller',
          users: [], // Empty for test mode
          testMode: true
        }
      });

      if (error) throw error;

      toast({
        title: "Test Message Sent! ✅",
        description: "Check your Telegram for the test diamond share",
      });

    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (diamondCountsLoading || loadingDiamonds) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading diamonds and user data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedDiamondData = getSelectedDiamondData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Diamond className="h-5 w-5" />
          Bulk Diamond Share
        </CardTitle>
        <CardDescription>
          Share a diamond from your inventory to all users via Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Select a diamond from your inventory</li>
            <li>• Send personalized message to all registered users</li>
            <li>• Includes view button that opens your diamond in the app</li>
            <li>• Tracks engagement and analytics for the shared diamond</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Target Audience</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Users:</span>
              <span className="ml-2 font-medium">{stats.totalUsers}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Users:</span>
              <span className="ml-2 font-medium text-green-600">{stats.usersWithDiamonds + stats.usersWithZeroDiamonds}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Select Diamond to Share</label>
          <Select value={selectedDiamond} onValueChange={setSelectedDiamond}>
            <SelectTrigger>
              <SelectValue placeholder={diamonds.length > 0 ? "Choose a diamond from your inventory" : "No diamonds available"} />
            </SelectTrigger>
            <SelectContent>
              {diamonds.map((diamond) => (
                <SelectItem key={diamond.id} value={diamond.id}>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4" />
                    <span>
                      {diamond.weight}ct {diamond.shape} - {diamond.color}/{diamond.clarity} - ${(diamond.price_per_carat * diamond.weight).toLocaleString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDiamondData && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">
              💎 Preview: {selectedDiamondData.weight}ct {selectedDiamondData.shape}
            </h4>
            <div className="text-sm space-y-1">
              <div><strong>Color:</strong> {selectedDiamondData.color}</div>
              <div><strong>Clarity:</strong> {selectedDiamondData.clarity}</div>
              <div><strong>Cut:</strong> {selectedDiamondData.cut}</div>
              <div><strong>Price:</strong> ${(selectedDiamondData.price_per_carat * selectedDiamondData.weight).toLocaleString()}</div>
              <div><strong>Stock:</strong> {selectedDiamondData.stock_number}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={sendTestMessage}
            disabled={isLoading || !selectedDiamond || diamonds.length === 0}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Test Message'}
          </Button>
          
          <Button 
            onClick={sendDiamondToAll}
            disabled={isLoading || !selectedDiamond || diamonds.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sharing...' : `Share to All Users (${userCounts.length})`}
          </Button>
        </div>

        {diamonds.length === 0 && (
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Gem className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              No diamonds in your inventory. Upload some diamonds first to use bulk sharing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}