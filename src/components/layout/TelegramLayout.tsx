import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Link } from "react-router-dom"
import { useTelegramAuth } from "@/context/TelegramAuthContext"
import { useEffect, useState } from "react"
import { useLocation } from 'react-router-dom';
import { Home, Upload, Sparkle, Settings, Users, LogOut, TrendingUp, Package, MessageCircle, BarChart3, Bell, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';

interface TelegramLayoutProps {
  children: React.ReactNode
}

export function TelegramLayout({ children }: TelegramLayoutProps) {
  const { user, isAuthenticated, isTelegramEnvironment } = useTelegramAuth()
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Initialize enhanced tracking
  const { analytics } = useEnhancedUserTracking();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    {
      to: '/dashboard',
      icon: Home,
      label: 'Dashboard',
    },
    {
      to: '/inventory',
      icon: Package,
      label: 'Inventory',
    },
    {
      to: '/store',
      icon: Sparkle,
      label: 'Store',
    },
    {
      to: '/upload',
      icon: Upload,
      label: 'Upload',
    },
    {
      to: '/insights',
      icon: BarChart3,
      label: 'Insights',
    },
    {
      to: '/chat',
      icon: MessageCircle,
      label: 'Chat',
    },
    {
      to: '/notifications',
      icon: Bell,
      label: 'Notifications',
    },
    {
      to: '/profile',
      icon: User,
      label: 'Profile',
    },
    {
      to: '/wishlist',
      icon: Heart,
      label: 'Wishlist',
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings',
    },
    {
      to: '/analytics',
      icon: TrendingUp,
      label: 'Analytics',
      badge: analytics?.last24Hours.pageViews ? `${analytics.last24Hours.pageViews}` : undefined
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-700">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden absolute top-4 left-4 z-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="px-6 py-4">
              <Link to="/" className="flex items-center text-lg font-semibold">
                <Home className="h-5 w-5 mr-2" />
                MazalBot
              </Link>
            </div>
            <nav className="flex-1 px-2 py-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center px-4 py-2 text-sm rounded-md hover:bg-gray-200 ${location.pathname === item.to ? 'bg-gray-200 font-semibold' : ''
                    }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            {isAuthenticated && isTelegramEnvironment && (
              <div className="p-4">
                <Button variant="outline" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200">
        <div className="px-6 py-4">
          <Link to="/" className="flex items-center text-lg font-semibold">
            <Home className="h-5 w-5 mr-2" />
            MazalBot
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center px-4 py-2 text-sm rounded-md hover:bg-gray-200 ${location.pathname === item.to ? 'bg-gray-200 font-semibold' : ''
                }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        {isAuthenticated && isTelegramEnvironment && (
          <div className="p-4">
            <Button variant="outline" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  )
}
