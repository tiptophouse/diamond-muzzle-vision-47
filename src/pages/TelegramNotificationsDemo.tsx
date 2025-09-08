import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TelegramNotificationsList } from '@/components/notifications/TelegramNotificationsList';
import { Bell, Plus } from 'lucide-react';

interface DiamondMatchNotification {
  id: string;
  title: string;
  message: string;
  type: 'diamond_match';
  read: boolean;
  created_at: string;
  data: {
    search_criteria: {
      shape: string;
      carat_min: number;
      carat_max: number;
      color: string;
      clarity: string;
      price_max: number;
    };
    matches: Array<{
      stock_number: string;
      shape: string;
      weight: number;
      color: string;
      clarity: string;
      price_per_carat: number;
      total_price: number;
      status: string;
      confidence: number;
    }>;
    customer_info: {
      name: string;
      phone: string;
      location: string;
    };
    confidence_score: number;
  };
}

interface ContactNotification {
  id: string;
  title: string;
  message: string;
  type: 'contact_request' | 'interest_expressed';
  read: boolean;
  created_at: string;
  data: {
    customer_info: {
      name: string;
      phone: string;
      location: string;
    };
  };
}

type Notification = DiamondMatchNotification | ContactNotification;

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Diamond Match Found",
    message: "מצאנו יהלום שמתאים בדיוק לדרישות הלקוח",
    type: "diamond_match",
    read: false,
    created_at: "2024-01-15T10:30:00Z",
    data: {
      search_criteria: {
        shape: "Round",
        carat_min: 1.0,
        carat_max: 2.0,
        color: "G",
        clarity: "VS1",
        price_max: 15000
      },
      matches: [
        {
          stock_number: "RB12345",
          shape: "Round",
          weight: 1.25,
          color: "G",
          clarity: "VS1",
          price_per_carat: 8500,
          total_price: 10625,
          status: "Available",
          confidence: 0.95
        },
        {
          stock_number: "RB67890",
          shape: "Round",
          weight: 1.15,
          color: "H",
          clarity: "VS2",
          price_per_carat: 7800,
          total_price: 8970,
          status: "Available",
          confidence: 0.85
        }
      ],
      customer_info: {
        name: "David Cohen",
        phone: "+972-50-123-4567",
        location: "Tel Aviv"
      },
      confidence_score: 0.92
    }
  },
  {
    id: "2",
    title: "High Interest Match",
    message: "לקוח חוזר שחיפש יהלום דומה 3 פעמים השבוע",
    type: "diamond_match",
    read: false,
    created_at: "2024-01-15T09:15:00Z",
    data: {
      search_criteria: {
        shape: "Princess",
        carat_min: 0.8,
        carat_max: 1.2,
        color: "F",
        clarity: "VVS2",
        price_max: 12000
      },
      matches: [
        {
          stock_number: "PR54321",
          shape: "Princess",
          weight: 1.01,
          color: "F",
          clarity: "VVS2",
          price_per_carat: 9200,
          total_price: 9292,
          status: "Available",
          confidence: 0.98
        }
      ],
      customer_info: {
        name: "Sarah Levy",
        phone: "+972-54-987-6543",
        location: "Jerusalem"
      },
      confidence_score: 0.96
    }
  },
  {
    id: "3",
    title: "Contact Request",
    message: "לקוח מעוניין ליצור קשר לגבי יהלום ספציפי",
    type: "contact_request",
    read: true,
    created_at: "2024-01-14T16:45:00Z",
    data: {
      customer_info: {
        name: "Michael Stone",
        phone: "+972-52-456-7890",
        location: "Haifa"
      }
    }
  }
];

export default function TelegramNotificationsDemo() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleContactCustomer = (customerInfo: any, diamond?: any) => {
    console.log('Contacting customer:', customerInfo);
    if (diamond) {
      console.log('Regarding diamond:', diamond);
    }
    alert(`Contacting ${customerInfo.name} at ${customerInfo.phone}`);
  };

  const addMockNotification = () => {
    const newNotification: DiamondMatchNotification = {
      id: `demo-${Date.now()}`,
      title: "New Diamond Match Found",
      message: "מצאנו יהלום שמתאים בדיוק לדרישות הלקוח",
      type: "diamond_match",
      read: false,
      created_at: new Date().toISOString(),
      data: {
        search_criteria: {
          shape: 'Round',
          carat_min: 1.0,
          carat_max: 2.0,
          color: 'G',
          clarity: 'VS1',
          price_max: 15000
        },
        matches: [
          {
            stock_number: `DEMO-${Math.floor(Math.random() * 10000)}`,
            shape: 'Round',
            weight: 1.25,
            color: 'G',
            clarity: 'VS1',
            price_per_carat: 8500,
            total_price: 10625,
            status: 'Available',
            confidence: 0.95
          }
        ],
        customer_info: {
          name: 'Demo Customer',
          phone: '+972-50-123-4567',
          location: 'Tel Aviv'
        },
        confidence_score: 0.85
      }
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const diamondMatches = notifications.filter(n => n.type === 'diamond_match').length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Telegram Notifications Demo
            </CardTitle>
            <CardDescription>
              Advanced notification system with Telegram native features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={addMockNotification} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Demo Notification
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total Notifications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{diamondMatches}</div>
              <div className="text-sm text-muted-foreground">Diamond Matches</div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Telegram-Native Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Haptic Feedback</Badge>
              <Badge variant="secondary">Main Button Integration</Badge>
              <Badge variant="secondary">Native Sharing</Badge>
              <Badge variant="secondary">Theme Integration</Badge>
              <Badge variant="secondary">Real-time Updates</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <TelegramNotificationsList
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onContactCustomer={handleContactCustomer}
        />
      </div>
    </div>
  );
}