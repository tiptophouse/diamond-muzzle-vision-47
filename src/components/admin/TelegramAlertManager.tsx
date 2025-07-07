import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTelegramAlerts } from '@/hooks/useTelegramAlerts';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Send, MessageSquare, AlertCircle, TrendingUp, Package } from 'lucide-react';

export function TelegramAlertManager() {
  const { user } = useTelegramAuth();
  const { sendAlert, sendSystemAlert, isLoading } = useTelegramAlerts();
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState<'inventory' | 'sale' | 'system' | 'price_change' | 'low_stock'>('system');
  const [telegramId, setTelegramId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [botType, setBotType] = useState<'main' | 'clients' | 'sellers'>('main');

  const handleSendAlert = async () => {
    if (!message.trim()) return;

    const alertData = {
      type: alertType,
      message: message.trim(),
      bot_type: botType,
      ...(telegramId && { telegram_id: parseInt(telegramId) }),
      ...(groupId && { group_id: parseInt(groupId) }),
    };

    const success = await sendAlert(alertData);
    if (success) {
      setMessage('');
      setTelegramId('');
      setGroupId('');
    }
  };

  const sendTestAlerts = async () => {
    const testAlerts = [
      {
        type: 'inventory' as const,
        message: 'Test inventory alert - New diamond added to collection!',
        data: {
          diamond: {
            stock_number: 'TEST001',
            shape: 'Round',
            weight: 1.50,
            color: 'G',
            clarity: 'VS1',
            price_per_carat: 8500
          }
        }
      },
      {
        type: 'sale' as const,
        message: 'Test sale alert - Diamond sold successfully!',
        data: {
          diamond: {
            stock_number: 'TEST002',
            shape: 'Princess',
            weight: 2.00,
            color: 'F',
            clarity: 'VVS2',
            price_per_carat: 12000
          }
        }
      },
      {
        type: 'low_stock' as const,
        message: 'Test low stock alert - Running low on inventory!',
        data: {
          stats: {
            'Current Stock': 8,
            'Threshold': 10,
            'Status': 'Below Threshold'
          }
        }
      }
    ];

    for (const alert of testAlerts) {
      await sendAlert({
        ...alert,
        bot_type: botType
      });
      // Small delay between alerts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const alertTypeIcons = {
    inventory: Package,
    sale: TrendingUp,
    system: AlertCircle,
    price_change: TrendingUp,
    low_stock: AlertCircle
  };

  const AlertIcon = alertTypeIcons[alertType];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Telegram Alert Manager
          </CardTitle>
          <CardDescription>
            Send alerts and notifications via Telegram bots
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alert-type">Alert Type</Label>
              <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Inventory
                    </div>
                  </SelectItem>
                  <SelectItem value="sale">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Sale
                    </div>
                  </SelectItem>
                  <SelectItem value="price_change">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Price Change
                    </div>
                  </SelectItem>
                  <SelectItem value="low_stock">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Low Stock
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bot-type">Bot Type</Label>
              <Select value={botType} onValueChange={(value: any) => setBotType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Bot</SelectItem>
                  <SelectItem value="clients">Clients Bot</SelectItem>
                  <SelectItem value="sellers">Sellers Bot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telegram-id">Telegram User ID (Optional)</Label>
              <Input
                id="telegram-id" 
                placeholder="Enter Telegram user ID"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-id">Group Chat ID (Optional)</Label>
              <Input
                id="group-id"
                placeholder="Enter group chat ID" 
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your alert message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSendAlert}
              disabled={!message.trim() || isLoading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send Alert'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={sendTestAlerts}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <AlertIcon className="h-4 w-4" />
              Send Test Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Status</CardTitle>
          <CardDescription>
            Current configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current User ID:</span>
              <Badge variant="secondary">{user?.id || 'Not logged in'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Selected Bot:</span>
              <Badge variant="outline">{botType}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Alert Type:</span>
              <Badge className="flex items-center gap-1">
                <AlertIcon className="h-3 w-3" />
                {alertType}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}