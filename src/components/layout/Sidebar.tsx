
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  Diamond, 
  Upload, 
  MessageCircle, 
  Settings, 
  Bell,
  User,
  BarChart3,
  Sparkles
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Diamond,
  },
  {
    title: "Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Insights",
    href: "/insights",
    icon: BarChart3,
  },
  {
    title: "AI Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useTelegramAuth();
  const isMobile = useIsMobile();

  return (
    <div className="h-full w-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="flex-1 py-2 sm:py-4">
        <div className="px-2 sm:px-3">
          {/* App Header - responsive sizing */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-diamond-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-semibold text-sidebar-foreground truncate">Diamond Muzzle</h2>
              <p className="text-xs text-sidebar-foreground/70 hidden sm:block">Premium Edition</p>
            </div>
          </div>
          
          {/* User Info - compact on mobile */}
          {user && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-sidebar-accent">
              <p className="text-xs sm:text-sm font-medium text-sidebar-foreground truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                @{user.username || 'user'}
              </p>
            </div>
          )}
          
          {/* Navigation Items */}
          <div className="space-y-1">
            <ScrollArea className={`${isMobile ? 'h-[calc(100vh-180px)]' : 'h-[calc(100vh-200px)]'}`}>
              {sidebarItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2",
                    location.pathname === item.href
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </Button>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
