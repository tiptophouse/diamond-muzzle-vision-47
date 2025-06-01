
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

  return (
    <div className="pb-12 w-64 bg-sidebar border-r border-sidebar-border">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-diamond-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">Diamond Muzzle</h2>
              <p className="text-xs text-sidebar-foreground/70">Premium Edition</p>
            </div>
          </div>
          
          {user && (
            <div className="mb-4 p-3 rounded-lg bg-sidebar-accent">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                @{user.username || 'user'}
              </p>
            </div>
          )}
          
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {sidebarItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    location.pathname === item.href
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
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
