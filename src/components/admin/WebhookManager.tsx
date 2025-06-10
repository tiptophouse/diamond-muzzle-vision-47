
import { useState } from 'react';
import { Send, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { BACKEND_CONFIG } from '@/lib/config/backend';

export function WebhookManager() {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [lastWebhookResult, setLastWebhookResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const testWebhook = async () => {
    setIsTestingWebhook(true);
    
    try {
      const testData = {
        event: 'webhook_test',
        timestamp: new Date().toISOString(),
        message: 'Admin panel webhook test',
        source: 'diamond_admin_panel'
      };

      await fetch(BACKEND_CONFIG.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify(testData),
      });

      // Since we're using no-cors, we assume success
      setLastWebhookResult('success');
      toast({
        title: "✅ Webhook Tested",
        description: "Test webhook sent to Make.com successfully",
      });
    } catch (error) {
      setLastWebhookResult('error');
      toast({
        variant: "destructive",
        title: "❌ Webhook Failed",
        description: "Failed to send test webhook",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const triggerInventorySync = async () => {
    try {
      const syncData = {
        event: 'inventory_sync_requested',
        timestamp: new Date().toISOString(),
        source: 'admin_panel'
      };

      await fetch(BACKEND_CONFIG.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify(syncData),
      });

      toast({
        title: "🔄 Sync Triggered",
        description: "Inventory sync automation triggered via Make.com",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Sync Failed",
        description: "Failed to trigger inventory sync",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Webhook & Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Make.com Integration</h4>
          <p className="text-sm text-gray-600 mb-3">
            Connected to: {BACKEND_CONFIG.MAKE_WEBHOOK_URL.substring(0, 50)}...
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            {lastWebhookResult === 'success' && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Last test successful
              </div>
            )}
            {lastWebhookResult === 'error' && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Last test failed
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testWebhook}
              disabled={isTestingWebhook}
              variant="outline"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {isTestingWebhook ? 'Testing...' : 'Test Webhook'}
            </Button>
            
            <Button
              onClick={triggerInventorySync}
              variant="outline"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Trigger Sync
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Available Events:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>diamond_created - New diamond added</li>
            <li>diamond_updated - Diamond modified</li>
            <li>diamond_deleted - Diamond removed</li>
            <li>inventory_sync_requested - Manual sync trigger</li>
            <li>webhook_test - Admin panel test</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
