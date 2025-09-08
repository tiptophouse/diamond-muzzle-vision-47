import React, { useState } from 'react';
import { TelegramNotificationsList } from '@/components/notifications/TelegramNotificationsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Sparkles } from 'lucide-react';

// Mock notifications data for demo
const mockNotifications = [
  {
    id: '1',
    title: 'High-Value Diamond Match Found',
    message: 'A client is looking for premium diamonds matching your inventory. Multiple high-confidence matches discovered.',
    type: 'diamond_match',
    read: false,
    created_at: new Date(Date.now() - 30000).toISOString(),
    data: {
      search_criteria: {
        shape: 'Round',
        carat_min: 2.0,
        carat_max: 3.0,
        color: 'F',
        clarity: 'VS1',
        price_max: 50000
      },
      matches: [
        {
          stock_number: 'RD2345',
          shape: 'Round',
          weight: 2.5,
          color: 'F',
          clarity: 'VS1',
          cut: 'Excellent',
          price_per_carat: 15000,
          total_price: 37500,
          status: 'Available',
          confidence: 0.95
        },
        {
          stock_number: 'RD2347',
          shape: 'Round',
          weight: 2.8,
          color: 'E',
          clarity: 'VS2',
          cut: 'Excellent',
          price_per_carat: 14500,
          total_price: 40600,
          status: 'Available',
          confidence: 0.88
        }
      ],
      customer_info: {
        name: 'Premium Client',
        phone: '+1-555-0123',
        location: 'New York'
      },
      confidence_score: 0.95
    }
  },
  {
    id: '2',
    title: 'Multiple Diamond Inquiries',
    message: 'High-demand shapes are trending. Several clients showing interest in princess cut diamonds.',
    type: 'buyer_interest',
    read: false,
    created_at: new Date(Date.now() - 120000).toISOString(),
    data: {
      matches: [
        {
          stock_number: 'PR1234',
          shape: 'Princess',
          weight: 1.5,
          color: 'G',
          clarity: 'VS2',
          cut: 'Excellent',
          price_per_carat: 8500,
          total_price: 12750,
          status: 'Available',
          confidence: 0.82
        }
      ]
    }
  },
  {
    id: '3',
    title: 'Price Alert Triggered',
    message: 'Market prices for emerald cuts have increased 5% this week. Your inventory value has increased.',
    type: 'price_alert',
    read: true,
    created_at: new Date(Date.now() - 300000).toISOString(),
    data: {
      matches: [
        {
          stock_number: 'EM5678',
          shape: 'Emerald',
          weight: 3.2,
          color: 'D',
          clarity: 'VVS1',
          price_per_carat: 18000,
          total_price: 57600,
          status: 'Available',
          confidence: 0.78
        }
      ]
    }
  },
  {
    id: '4',
    title: 'Customer Inquiry',
    message: 'New customer inquiry from premium client looking for engagement ring centerpiece.',
    type: 'customer_inquiry',
    read: true,
    created_at: new Date(Date.now() - 600000).toISOString(),
    data: {
      customer_info: {
        name: 'VIP Customer',
        phone: '+1-555-0199',
        location: 'Los Angeles'
      }
    }
  }
];

export default function TelegramNotificationsDemo() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleContactCustomer = (customerInfo: any, diamond?: any) => {
    // Simulate Telegram contact action
    console.log('Contacting customer:', customerInfo, 'for diamond:', diamond);
    alert(`Would open Telegram to contact ${customerInfo?.name || 'customer'} about ${diamond?.stock_number || 'inquiry'}`);
  };

  const addMockNotification = () => {
    const newNotification = {
      id: String(Date.now()),
      title: 'New Diamond Match',
      message: 'Urgent: High-value client looking for certified diamonds with immediate availability.',
      type: 'diamond_match',
      read: false,
      created_at: new Date().toISOString(),
      data: {
        search_criteria: {
          shape: 'Round',
          carat_min: 1.0,
          carat_max: 3.0,
          color: 'F',
          clarity: 'VS1',
          price_max: 50000
        },
        matches: [
          {
            stock_number: `MD${Math.floor(Math.random() * 9999)}`,
            shape: ['Round', 'Princess', 'Emerald', 'Oval'][Math.floor(Math.random() * 4)],
            weight: 1.5 + Math.random() * 2,
            color: ['D', 'E', 'F', 'G'][Math.floor(Math.random() * 4)],
            clarity: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1'][Math.floor(Math.random() * 5)],
            price_per_carat: 10000 + Math.random() * 15000,
            total_price: 25000,
            status: 'Available',
            confidence: 0.7 + Math.random() * 0.3
          }
        ],
        customer_info: {
          name: 'New Premium Client',
          phone: '+1-555-0000',
          location: 'Demo City'
        },
        confidence_score: 0.85
      }
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const diamondMatches = notifications.filter(n => n.type === 'diamond_match').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Telegram Notifications</h1>
                <p className="text-sm text-muted-foreground">Beautiful diamond notifications for Telegram Mini App</p>
              </div>
            </div>
            <Button size="sm" onClick={addMockNotification} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-primary">{notifications.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
                <div className="text-xs text-muted-foreground">Unread</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-blue-600">{diamondMatches}</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Demo Features Info */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Telegram-Native Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <Badge variant="outline" className="justify-center bg-white/60">
            🎯 Haptic Feedback on Interactions
          </Badge>
          <Badge variant="outline" className="justify-center bg-white/60">
            📱 Mobile-First Touch Design
          </Badge>
          <Badge variant="outline" className="justify-center bg-white/60">
            💎 Beautiful Diamond Cards
          </Badge>
        </div>
      </div>

      {/* Notifications List */}
      <TelegramNotificationsList
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onContactCustomer={handleContactCustomer}
      />
    </div>
  );
}