# BrilliantBot - Continuous Implementation Guide

**PASTE THIS ENTIRE PROMPT INTO YOUR NEW LOVABLE PROJECT**

This is a phase-by-phase implementation guide. Follow each phase in order, and only move to the next phase after completing the current one.

---

## 🎯 PHASE 0: CRITICAL FOUNDATION

### Goal
Get Telegram Mini App environment working with FastAPI authentication.

### Step 0.1: Install Dependencies

```bash
# Required packages
@telegram-apps/sdk@3.11.8
@tanstack/react-query
react-router-dom
@supabase/supabase-js
```

### Step 0.2: Create Telegram SDK Initialization

Create `src/hooks/useTelegramWebApp.ts`:

```typescript
import { useEffect, useState } from 'react';
import { 
  init as initSDK,
  miniApp,
  viewport,
  themeParams,
  initData,
  backButton
} from '@telegram-apps/sdk';

export function useTelegramWebApp() {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      // Initialize Telegram SDK
      initSDK();
      
      // Mount components
      if (miniApp.mount.isAvailable()) {
        miniApp.mount();
        miniApp.ready();
      }
      
      if (viewport.mount.isAvailable()) {
        viewport.mount();
        viewport.expand();
      }

      // Disable vertical swipes
      if (miniApp.disableVerticalSwipes && miniApp.disableVerticalSwipes.isAvailable()) {
        miniApp.disableVerticalSwipes();
      }

      // Enable closing confirmation
      if (miniApp.enableClosingConfirmation && miniApp.enableClosingConfirmation.isAvailable()) {
        miniApp.enableClosingConfirmation();
      }

      // Get user data from initData
      if (initData.user()) {
        setUser(initData.user());
      }

      setWebApp({
        initData: initData.raw(),
        platform: miniApp.platform,
        version: miniApp.version,
        themeParams: themeParams.get()
      });

      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize Telegram SDK:', error);
    }
  }, []);

  return {
    webApp,
    user,
    isReady,
    hapticFeedback: {
      impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
        if (miniApp.impactOccurred && miniApp.impactOccurred.isAvailable()) {
          miniApp.impactOccurred(style);
        }
      },
      notification: (type: 'error' | 'success' | 'warning') => {
        if (miniApp.notificationOccurred && miniApp.notificationOccurred.isAvailable()) {
          miniApp.notificationOccurred(type);
        }
      }
    },
    backButton: {
      show: () => backButton.show(),
      hide: () => backButton.hide()
    }
  };
}
```

### Step 0.3: Create Authentication Hook

Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

const BACKEND_URL = 'https://api.mazalbot.com';

export function useAuth() {
  const { webApp, isReady } = useTelegramWebApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !webApp?.initData) {
      setError('Please open this app from Telegram');
      setIsLoading(false);
      return;
    }

    async function authenticate() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/sign-in/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ init_data: webApp.initData })
        });

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status}`);
        }

        const data = await response.json();
        setJwtToken(data.access_token);
        setIsAuthenticated(true);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    authenticate();
  }, [isReady, webApp]);

  return { isAuthenticated, isLoading, error, jwtToken };
}
```

### Step 0.4: Create Auth Guard Component

Create `src/components/auth/AuthGuard.tsx`:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Authenticating...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
        <p className="text-sm text-center text-muted-foreground">
          Please open this app from Telegram
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
        <p className="text-muted-foreground text-center">
          Unable to verify your Telegram identity
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Step 0.5: Create Main Layout with Bottom Navigation

Create `src/components/layout/MainLayout.tsx`:

```typescript
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Store, Bell, Settings } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hapticFeedback } = useTelegramWebApp();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/store', icon: Store, label: 'Store' },
    { path: '/notifications', icon: Bell, label: 'Alerts' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const handleNavClick = (path: string) => {
    hapticFeedback.impact('light');
    navigate(path);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
```

### Step 0.6: Add Telegram-Specific CSS

Add to `src/index.css`:

```css
/* Telegram Mini App specific styles */
html, body, #root {
  height: 100%;
  overflow: hidden;
  position: fixed;
  width: 100%;
}

#root {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Safe area insets for iOS notch */
.safe-area-inset-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Disable pull-to-refresh */
body {
  overscroll-behavior-y: none;
}
```

### Step 0.7: Setup Routes

Create `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { Toaster } from '@/components/ui/toaster';

// Placeholder pages
const DashboardPage = () => <div className="p-4">Dashboard</div>;
const InventoryPage = () => <div className="p-4">Inventory</div>;
const StorePage = () => <div className="p-4">Store</div>;
const NotificationsPage = () => <div className="p-4">Notifications</div>;
const SettingsPage = () => <div className="p-4">Settings</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="store" element={<StorePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AuthGuard>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### ✅ Phase 0 Complete Checklist

- [ ] App opens in Telegram without errors
- [ ] Authentication with FastAPI works
- [ ] Bottom navigation shows and is clickable
- [ ] Haptic feedback triggers on navigation
- [ ] "Please open from Telegram" error shows when opened in browser

**TEST**: Open the app in Telegram. You should see the bottom navigation and be able to navigate between pages.

---

## 💎 PHASE 1: MINIMUM DIAMOND CRUD

### Goal
Basic diamond listing, adding, and viewing functionality.

### Step 1.1: Create Data Transformation Layer

Create `src/lib/api/transformers.ts`:

```typescript
export interface DiamondFormData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  certificateNumber?: string;
  certificateUrl?: string;
  lab?: string;
  length?: number;
  width?: number;
  depth?: number;
  ratio: number;
  tablePercentage?: number;
  depthPercentage?: number;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  culet?: string;
  price: number;
  pricePerCarat?: number;
  picture?: string;
  videoUrl?: string;
}

export function transformToFastAPICreate(data: DiamondFormData) {
  return {
    stock: data.stockNumber,
    shape: data.shape,
    weight: data.carat,
    color: data.color,
    clarity: data.clarity,
    cut: data.cut || 'Excellent',
    certificate_number: data.certificateNumber ? parseInt(data.certificateNumber) : null,
    certificate_url: data.certificateUrl || null,
    lab: data.lab || 'GIA',
    length: data.length || null,
    width: data.width || null,
    depth: data.depth || null,
    ratio: data.ratio,
    table_percentage: data.tablePercentage || null,
    depth_percentage: data.depthPercentage || null,
    fluorescence: data.fluorescence || 'None',
    polish: data.polish || 'Excellent',
    symmetry: data.symmetry || 'Excellent',
    culet: data.culet || 'None',
    total_price: data.price,
    price_per_carat: data.pricePerCarat || null,
    picture: data.picture || null,
    video_url: data.videoUrl || null
  };
}
```

### Step 1.2: Create API Client

Create `src/lib/api/client.ts`:

```typescript
const BACKEND_URL = 'https://api.mazalbot.com';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}
```

### Step 1.3: Create Diamond API Hook

Create `src/hooks/api/useDiamonds.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api/client';
import { transformToFastAPICreate } from '@/lib/api/transformers';
import { useToast } from '@/hooks/use-toast';
import type { DiamondFormData } from '@/lib/api/transformers';

export function useDiamonds() {
  const { jwtToken } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['diamonds'],
    queryFn: async () => {
      const data = await apiRequest('/api/v1/get_all_stones', {}, jwtToken!);
      return data.stones || [];
    },
    enabled: !!jwtToken
  });
}

export function useCreateDiamond() {
  const { jwtToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diamondData: DiamondFormData) => {
      const payload = transformToFastAPICreate(diamondData);
      
      try {
        const response = await apiRequest(
          '/api/v1/diamonds',
          {
            method: 'POST',
            body: JSON.stringify(payload)
          },
          jwtToken!
        );

        toast({
          title: '✅ Diamond Added',
          description: `${diamondData.stockNumber} was added successfully`,
        });

        return response;
      } catch (error: any) {
        toast({
          title: '❌ Failed to Add Diamond',
          description: `URL: /api/v1/diamonds\nError: ${error.message}\nBody: ${JSON.stringify(payload).substring(0, 300)}`,
          variant: 'destructive',
          duration: 10000
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
    }
  });
}
```

### Step 1.4: Create Diamond Card Component

Create `src/components/diamonds/DiamondCard.tsx`:

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DiamondCardProps {
  diamond: any;
  onClick?: () => void;
}

export function DiamondCard({ diamond, onClick }: DiamondCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {diamond.picture && (
          <img
            src={diamond.picture}
            alt={diamond.stock}
            className="w-full h-48 object-cover rounded-md mb-3"
          />
        )}
        
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{diamond.stock}</h3>
          <Badge variant="secondary">{diamond.shape}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Carat:</span>
            <span className="ml-2 font-medium">{diamond.weight}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Color:</span>
            <span className="ml-2 font-medium">{diamond.color}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Clarity:</span>
            <span className="ml-2 font-medium">{diamond.clarity}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cut:</span>
            <span className="ml-2 font-medium">{diamond.cut}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xl font-bold text-primary">
            ${diamond.total_price?.toLocaleString()}
          </div>
          {diamond.price_per_carat && (
            <div className="text-sm text-muted-foreground">
              ${diamond.price_per_carat.toLocaleString()}/ct
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 1.5: Create Inventory Page

Create `src/pages/InventoryPage.tsx`:

```typescript
import { useDiamonds } from '@/hooks/api/useDiamonds';
import { DiamondCard } from '@/components/diamonds/DiamondCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function InventoryPage() {
  const { data: diamonds, isLoading } = useDiamonds();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Inventory</h1>
        <Button onClick={() => navigate('/inventory/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Diamond
        </Button>
      </div>

      {diamonds?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💎</div>
          <p className="text-muted-foreground mb-4">No diamonds yet</p>
          <Button onClick={() => navigate('/inventory/add')}>
            Add Your First Diamond
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diamonds?.map((diamond: any) => (
            <DiamondCard 
              key={diamond.id}
              diamond={diamond}
              onClick={() => navigate(`/diamond/${diamond.stock}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 1.6: Create Add Diamond Form

Create `src/pages/AddDiamondPage.tsx`:

```typescript
import { useForm } from 'react-hook-form';
import { useCreateDiamond } from '@/hooks/api/useDiamonds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useNavigate } from 'react-router-dom';
import type { DiamondFormData } from '@/lib/api/transformers';

const SHAPES = ['Round', 'Princess', 'Cushion', 'Emerald', 'Oval', 'Radiant', 'Asscher', 'Marquise', 'Heart', 'Pear'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
const CUTS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

export function AddDiamondPage() {
  const { register, handleSubmit, setValue, watch } = useForm<DiamondFormData>();
  const createDiamond = useCreateDiamond();
  const { hapticFeedback } = useTelegramWebApp();
  const navigate = useNavigate();

  const onSubmit = async (data: DiamondFormData) => {
    hapticFeedback.impact('medium');
    await createDiamond.mutateAsync(data);
    hapticFeedback.notification('success');
    navigate('/inventory');
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Add Diamond</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Stock Number */}
        <div>
          <Label htmlFor="stockNumber">Stock Number *</Label>
          <Input 
            id="stockNumber" 
            {...register('stockNumber', { required: true })}
            placeholder="e.g., D12345"
          />
        </div>

        {/* Shape */}
        <div>
          <Label htmlFor="shape">Shape *</Label>
          <Select onValueChange={(value) => setValue('shape', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              {SHAPES.map(shape => (
                <SelectItem key={shape} value={shape}>{shape}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Carat */}
        <div>
          <Label htmlFor="carat">Carat Weight *</Label>
          <Input 
            id="carat"
            type="number"
            step="0.01"
            {...register('carat', { required: true, valueAsNumber: true })}
            placeholder="e.g., 1.50"
          />
        </div>

        {/* Color */}
        <div>
          <Label htmlFor="color">Color *</Label>
          <Select onValueChange={(value) => setValue('color', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map(color => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clarity */}
        <div>
          <Label htmlFor="clarity">Clarity *</Label>
          <Select onValueChange={(value) => setValue('clarity', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select clarity" />
            </SelectTrigger>
            <SelectContent>
              {CLARITIES.map(clarity => (
                <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cut */}
        <div>
          <Label htmlFor="cut">Cut *</Label>
          <Select onValueChange={(value) => setValue('cut', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select cut" />
            </SelectTrigger>
            <SelectContent>
              {CUTS.map(cut => (
                <SelectItem key={cut} value={cut}>{cut}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ratio */}
        <div>
          <Label htmlFor="ratio">Ratio *</Label>
          <Input 
            id="ratio"
            type="number"
            step="0.01"
            {...register('ratio', { required: true, valueAsNumber: true })}
            placeholder="e.g., 1.00"
          />
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">Total Price *</Label>
          <Input 
            id="price"
            type="number"
            {...register('price', { required: true, valueAsNumber: true })}
            placeholder="e.g., 15000"
          />
        </div>

        {/* Certificate Number */}
        <div>
          <Label htmlFor="certificateNumber">Certificate Number</Label>
          <Input 
            id="certificateNumber"
            {...register('certificateNumber')}
            placeholder="e.g., 2141234567"
          />
        </div>

        {/* Picture URL */}
        <div>
          <Label htmlFor="picture">Picture URL</Label>
          <Input 
            id="picture"
            {...register('picture')}
            placeholder="https://..."
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={createDiamond.isPending}
        >
          {createDiamond.isPending ? 'Adding...' : 'Add Diamond'}
        </Button>
      </form>
    </div>
  );
}
```

### Step 1.7: Update Routes

Update `src/App.tsx` to add new routes:

```typescript
import { AddDiamondPage } from '@/pages/AddDiamondPage';
import { InventoryPage } from '@/pages/InventoryPage';

// In your routes:
<Route path="inventory" element={<InventoryPage />} />
<Route path="inventory/add" element={<AddDiamondPage />} />
```

### ✅ Phase 1 Complete Checklist

- [ ] Can view list of diamonds in inventory
- [ ] Can add a new diamond via form
- [ ] Toast notifications show on success/error
- [ ] Diamond cards display correctly with images
- [ ] Navigation between inventory and add page works

**TEST**: Add a diamond and verify it appears in the inventory list.

---

## 🔥 PHASE 2: AUCTION SYSTEM

### Goal
Create, view, and bid on auctions with real-time updates.

### Step 2.1: Setup Supabase Tables

Run this Supabase migration:

```sql
-- Create auctions table
CREATE TABLE public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_number TEXT NOT NULL,
  seller_telegram_id BIGINT NOT NULL,
  starting_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  min_increment NUMERIC NOT NULL DEFAULT 50,
  reserve_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  bid_count INTEGER DEFAULT 0,
  winner_telegram_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create auction_diamonds table (snapshot)
CREATE TABLE public.auction_diamonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  stock_number TEXT NOT NULL,
  shape TEXT,
  weight NUMERIC,
  color TEXT,
  clarity TEXT,
  cut TEXT,
  polish TEXT,
  symmetry TEXT,
  fluorescence TEXT,
  measurements TEXT,
  table_percentage NUMERIC,
  depth_percentage NUMERIC,
  certificate_number BIGINT,
  lab TEXT,
  picture TEXT,
  certificate_url TEXT,
  video_url TEXT,
  price_per_carat NUMERIC,
  total_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create auction_bids table
CREATE TABLE public.auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_telegram_id BIGINT NOT NULL,
  bidder_name TEXT,
  bid_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_diamonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active auctions"
  ON public.auctions FOR SELECT
  USING (status = 'active' OR seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::BIGINT, 0));

CREATE POLICY "Sellers can create auctions"
  ON public.auctions FOR INSERT
  WITH CHECK (seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::BIGINT, 0));

CREATE POLICY "Anyone can view auction diamonds"
  ON public.auction_diamonds FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view auction bids"
  ON public.auction_bids FOR SELECT
  USING (true);

CREATE POLICY "Users can place bids"
  ON public.auction_bids FOR INSERT
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE auction_bids;
```

### Step 2.2: Create Auction Creation Hook

Create `src/hooks/api/useAuctions.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface CreateAuctionParams {
  diamond: any;
  startingPrice: number;
  durationMinutes: number;
  minIncrement: number;
}

export function useCreateAuction() {
  const { toast } = useToast();
  const { hapticFeedback, user } = useTelegramWebApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ diamond, startingPrice, durationMinutes, minIncrement }: CreateAuctionParams) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Set user context for RLS
      await supabase.rpc('set_user_context', { 
        telegram_id: user.id 
      });

      const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000);

      // Create auction
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .insert({
          stock_number: diamond.stock,
          seller_telegram_id: user.id,
          starting_price: startingPrice,
          current_price: startingPrice,
          min_increment: minIncrement,
          ends_at: endsAt.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (auctionError) throw auctionError;

      // Create diamond snapshot
      const { error: diamondError } = await supabase
        .from('auction_diamonds')
        .insert({
          auction_id: auction.id,
          stock_number: diamond.stock,
          shape: diamond.shape,
          weight: diamond.weight,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut,
          polish: diamond.polish,
          symmetry: diamond.symmetry,
          fluorescence: diamond.fluorescence,
          measurements: `${diamond.length}x${diamond.width}x${diamond.depth}`,
          table_percentage: diamond.table_percentage,
          depth_percentage: diamond.depth_percentage,
          certificate_number: diamond.certificate_number,
          lab: diamond.lab,
          picture: diamond.picture,
          certificate_url: diamond.certificate_url,
          video_url: diamond.video_url,
          price_per_carat: diamond.price_per_carat,
          total_price: diamond.total_price
        });

      if (diamondError) throw diamondError;

      hapticFeedback.notification('success');
      toast({
        title: '🎉 Auction Created!',
        description: `Auction for ${diamond.stock} is now live`,
      });

      return auction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    }
  });
}
```

### Step 2.3: Create Auction Detail Page

Create `src/pages/AuctionPage.tsx`:

```typescript
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeAuctionBids } from '@/hooks/useRealtimeAuctionBids';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, TrendingUp, Gavel } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';

export function AuctionPage() {
  const { auctionId } = useParams();
  const { user, hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState('');

  // Fetch auction details
  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (auctionError) throw auctionError;

      const { data: diamondData, error: diamondError } = await supabase
        .from('auction_diamonds')
        .select('*')
        .eq('auction_id', auctionId)
        .single();

      if (diamondError) throw diamondError;

      return { auction: auctionData, diamond: diamondData };
    }
  });

  // Real-time bid updates
  const { bids, currentPrice, bidCount } = useRealtimeAuctionBids(auctionId!);

  // Countdown timer
  useEffect(() => {
    if (!auction?.auction.ends_at) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(auction.auction.ends_at).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining('ENDED');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const handlePlaceBid = async () => {
    if (!user?.id || !auction) return;

    hapticFeedback.impact('medium');

    const newBidAmount = currentPrice + auction.auction.min_increment;

    try {
      // Insert bid
      const { error: bidError } = await supabase
        .from('auction_bids')
        .insert({
          auction_id: auctionId,
          bidder_telegram_id: user.id,
          bidder_name: user.firstName || 'Anonymous',
          bid_amount: newBidAmount
        });

      if (bidError) throw bidError;

      // Update auction current price
      const { error: updateError } = await supabase
        .from('auctions')
        .update({
          current_price: newBidAmount,
          bid_count: bidCount + 1
        })
        .eq('id', auctionId);

      if (updateError) throw updateError;

      hapticFeedback.notification('success');
      toast({
        title: '✅ Bid Placed!',
        description: `Your bid of $${newBidAmount.toLocaleString()} was placed`,
      });
    } catch (error: any) {
      hapticFeedback.notification('error');
      toast({
        title: '❌ Bid Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!auction) {
    return <div className="p-4">Auction not found</div>;
  }

  const { auction: auctionData, diamond } = auction;

  return (
    <div className="p-4 pb-20">
      {/* Auction Status Badge */}
      <div className="flex justify-between items-center mb-4">
        <Badge variant={timeRemaining === 'ENDED' ? 'destructive' : 'default'} className="text-lg px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          {timeRemaining}
        </Badge>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <TrendingUp className="h-4 w-4 mr-2" />
          {bidCount} Bids
        </Badge>
      </div>

      {/* Diamond Image */}
      {diamond.picture && (
        <img
          src={diamond.picture}
          alt={diamond.stock_number}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      )}

      {/* Diamond Details */}
      <div className="bg-card rounded-lg p-4 mb-4">
        <h1 className="text-2xl font-bold mb-2">{diamond.stock_number}</h1>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Shape:</span>
            <span className="ml-2 font-medium">{diamond.shape}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Carat:</span>
            <span className="ml-2 font-medium">{diamond.weight}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Color:</span>
            <span className="ml-2 font-medium">{diamond.color}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Clarity:</span>
            <span className="ml-2 font-medium">{diamond.clarity}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cut:</span>
            <span className="ml-2 font-medium">{diamond.cut}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Lab:</span>
            <span className="ml-2 font-medium">{diamond.lab}</span>
          </div>
        </div>
      </div>

      {/* Current Price */}
      <div className="bg-primary/10 rounded-lg p-6 mb-4 text-center">
        <div className="text-sm text-muted-foreground mb-2">Current Bid</div>
        <div className="text-4xl font-bold text-primary mb-2">
          ${currentPrice.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">
          Min increment: ${auctionData.min_increment}
        </div>
      </div>

      {/* Place Bid Button */}
      {timeRemaining !== 'ENDED' && (
        <Button 
          className="w-full h-14 text-lg"
          onClick={handlePlaceBid}
        >
          <Gavel className="h-5 w-5 mr-2" />
          Place Bid: ${(currentPrice + auctionData.min_increment).toLocaleString()}
        </Button>
      )}

      {/* Recent Bids */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Recent Bids</h2>
        {bids.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No bids yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {bids.slice(0, 10).map((bid: any) => (
              <div key={bid.id} className="flex justify-between items-center bg-card rounded-lg p-3">
                <div>
                  <div className="font-medium">{bid.bidder_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(bid.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-lg font-bold text-primary">
                  ${bid.bid_amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 2.4: Create Realtime Hook

Create `src/hooks/useRealtimeAuctionBids.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeAuctionBids(auctionId: string) {
  const [bids, setBids] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [bidCount, setBidCount] = useState<number>(0);

  useEffect(() => {
    if (!auctionId) return;

    // Fetch initial data
    const fetchInitialData = async () => {
      const { data: auctionData } = await supabase
        .from('auctions')
        .select('current_price, bid_count')
        .eq('id', auctionId)
        .single();

      if (auctionData) {
        setCurrentPrice(auctionData.current_price);
        setBidCount(auctionData.bid_count || 0);
      }

      const { data: bidsData } = await supabase
        .from('auction_bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (bidsData) {
        setBids(bidsData);
      }
    };

    fetchInitialData();

    // Subscribe to real-time bid updates
    const channel = supabase
      .channel(`auction-bids-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_bids',
          filter: `auction_id=eq.${auctionId}`
        },
        (payload) => {
          const newBid = payload.new;
          setBids(prev => [newBid, ...prev.slice(0, 9)]);
          setCurrentPrice(newBid.bid_amount);
          setBidCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  return { bids, currentPrice, bidCount };
}
```

### ✅ Phase 2 Complete Checklist

- [ ] Can create auction from diamond detail page
- [ ] Auction detail page shows diamond info and countdown
- [ ] Can place bids and see real-time updates
- [ ] Recent bids list updates live when new bids are placed
- [ ] Toast notifications show on bid success/failure

**TEST**: Create an auction, open it in two different Telegram sessions, place a bid from one session and verify it appears instantly in the other.

---

## 📝 NEXT PHASES OVERVIEW

### Phase 3: Notifications & AI (Week 5)
- Fetch buyer notifications from FastAPI
- Enable Lovable Cloud AI integration
- Generate personalized buyer messages with AI
- Send rich diamond cards via Telegram bot

### Phase 4: Store & Sharing (Week 6)
- Public diamond catalog page
- Advanced filtering and search
- Telegram Story sharing
- Share to group functionality

### Phase 5: Polish & Admin (Week 7)
- Bulk CSV upload
- Admin dashboard
- Subscription/billing integration
- Production optimizations

---

## 🚀 READY TO START?

**Paste this entire prompt into your new Lovable project and say:**

"Start with Phase 0: Critical Foundation"

I will guide you through each phase step-by-step, ensuring everything works before moving to the next phase.

---

## 📋 SECRETS YOU'LL NEED

Before Phase 2 (Auctions), make sure you have:

- `TELEGRAM_BOT_TOKEN` - From @BotFather
- `TELEGRAM_BOT_USERNAME` - Your bot's username
- `B2B_GROUP_ID` - Your Telegram group chat ID

For Phase 3 (AI), you'll need:
- `LOVABLE_API_KEY` - Automatically provided by Lovable

---

**Good luck building BrilliantBot! 💎**
