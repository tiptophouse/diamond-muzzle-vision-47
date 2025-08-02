
import React, { useState } from 'react';
import { Crown, Users, Send, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function PremiumPromotionSender() {
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handlePromoteUsers = async () => {
    if (!testMode && !window.confirm('Are you sure you want to promote ALL users to premium? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('🎉 Starting premium promotion...', { testMode });

      const { data, error } = await supabase.functions.invoke('promote-users-to-premium', {
        body: { testMode }
      });

      if (error) throw error;

      console.log('✅ Promotion completed:', data);
      setResult(data);

      toast({
        title: "Premium Promotion Completed!",
        description: `Successfully promoted ${data.promotedCount} users to premium and sent ${data.notificationsSent} notifications.`,
      });

    } catch (error: any) {
      console.error('❌ Premium promotion failed:', error);
      toast({
        title: "Promotion Failed",
        description: error.message || "Failed to promote users to premium",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          <CardTitle className="text-2xl">Premium User Promotion</CardTitle>
        </div>
        <CardDescription>
          Promote all active users to premium status and send them personalized notifications about their new benefits
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            <Label htmlFor="test-mode" className="text-blue-800 font-medium">
              Test Mode (Admin Only)
            </Label>
          </div>
          <Switch
            id="test-mode"
            checked={testMode}
            onCheckedChange={setTestMode}
          />
        </div>

        {/* Premium Benefits Preview */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Premium Benefits Users Will Receive:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-yellow-700">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>Access to 100+ selected diamond groups</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>Higher upload limitations</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>Early access to new features</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>VIP groups with rare diamonds</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>Advanced search without limits</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <span>Priority support</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handlePromoteUsers}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                {testMode ? 'Testing...' : 'Promoting Users...'}
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                {testMode ? 'Test Premium Promotion' : 'Promote All Users to Premium'}
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <Alert className="border-green-200 bg-green-50">
            <Users className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="font-medium mb-2">
                {testMode ? 'Test Completed Successfully!' : 'Premium Promotion Completed!'}
              </div>
              <div className="space-y-1 text-sm">
                <div>✅ Users promoted: <strong>{result.promotedCount}</strong></div>
                <div>📧 Notifications sent: <strong>{result.notificationsSent}</strong></div>
                {result.errors?.length > 0 && (
                  <div>⚠️ Errors: <strong>{result.errors.length}</strong></div>
                )}
              </div>
              {result.errors?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">View Errors</summary>
                  <div className="mt-1 text-xs bg-white p-2 rounded border">
                    {result.errors.map((error: string, index: number) => (
                      <div key={index} className="text-red-600">• {error}</div>
                    ))}
                  </div>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Warning */}
        {!testMode && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>⚠️ Warning:</strong> This will promote ALL active users to premium status and send them notifications. This action cannot be undone.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
