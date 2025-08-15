
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Users, 
  Send, 
  Loader2, 
  Diamond, 
  Clock,
  Target,
  Zap
} from 'lucide-react';

export function InvestmentNotificationSender() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  
  const investmentMessage = `🚀 **EXCLUSIVE: BrilliantBot Investment Opportunity**

💎 Join the Diamond Trading Revolution!
📈 49 users already upgraded to $50/month premium (vs $75 standard)
🎯 Seeking strategic investors: 3-15% equity stake
⏰ **LIMITED TIME: 72 hours only**

🔗 **Secure Investment Portal:**
brilliantbot-investor-hub.lovable.app/investment

*Investment details subject to NDA & Non-Compete Agreement*

#DiamondTech #Investment #Opportunity`;

  const handleSendInvestmentNotification = async () => {
    setIsLoading(true);
    
    try {
      console.log('📤 Sending investment opportunity notification');
      
      // Get all users for the notification
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast({
          title: 'No Users Found',
          description: 'No users available to send investment notification',
          variant: 'destructive',
        });
        return;
      }

      // Send the investment notification
      const { data, error } = await supabase.functions.invoke('send-investment-notification', {
        body: {
          message: investmentMessage,
          users: users,
          testMode: testMode,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: testMode ? 'Test Investment Notification Sent' : 'Investment Notification Sent',
        description: testMode 
          ? 'Test message sent to admin for review'
          : `Investment opportunity sent to ${users.length} users`,
      });

    } catch (error) {
      console.error('❌ Error sending investment notification:', error);
      toast({
        title: 'Error Sending Notification',
        description: 'Failed to send investment opportunity notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <TrendingUp className="h-6 w-6" />
            Investment Opportunity Campaign
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <Clock className="h-3 w-3 mr-1" />
              72 Hours Limited
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700">
              <Target className="h-3 w-3 mr-1" />
              3-15% Equity
            </Badge>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              <Diamond className="h-3 w-3 mr-1" />
              Strategic Investment
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Campaign Overview
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-blue-700">
                  <Users className="w-4 h-4" />
                  <strong>Target:</strong> All registered users
                </p>
                <p className="flex items-center gap-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <strong>Duration:</strong> 72 hours only
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-blue-700">
                  <Target className="w-4 h-4" />
                  <strong>Goal:</strong> Attract strategic investors
                </p>
                <p className="flex items-center gap-2 text-blue-700">
                  <Diamond className="w-4 h-4" />
                  <strong>Equity:</strong> 3-15% investment range
                </p>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Investment Message Preview:</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <Textarea
                value={investmentMessage}
                readOnly
                className="min-h-[200px] resize-none bg-transparent border-none"
              />
            </div>
          </div>

          <Separator />

          {/* Key Features Highlight */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">49</div>
              <div className="text-sm text-green-600">Premium Users</div>
              <div className="text-xs text-green-500">$50/month locked</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">72h</div>
              <div className="text-sm text-orange-600">Limited Time</div>
              <div className="text-xs text-orange-500">Urgency factor</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">3-15%</div>
              <div className="text-sm text-purple-600">Equity Range</div>
              <div className="text-xs text-purple-500">Strategic stake</div>
            </div>
          </div>

          {/* Send Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSendInvestmentNotification}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Investment Notification
            </Button>
            
            <Button
              onClick={() => {
                setTestMode(true);
                handleSendInvestmentNotification();
              }}
              disabled={isLoading}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {isLoading && testMode ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Test Send (Admin Only)
            </Button>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">📋 Campaign Notes:</h4>
            <div className="text-sm text-amber-700 space-y-1">
              <p>• Investment page includes NDA & Non-Compete signature flow</p>
              <p>• Calendly integration for automated meeting scheduling</p>
              <p>• 72-hour countdown timer creates urgency</p>
              <p>• Social proof with current user metrics (49/100)</p>
              <p>• Professional investment presentation ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
