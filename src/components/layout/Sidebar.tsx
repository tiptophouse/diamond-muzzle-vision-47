
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Settings,
  Database,
  Upload,
  MessageSquare,
  Lightbulb,
  FileText,
  Menu,
  X,
  Bell,
  Sparkles,
  Star
} from "lucide-react";
import { useState } from "react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

const ADMIN_TELEGRAM_ID = 2138564172;

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick?: () => void;
  isAdminOnly?: boolean;
}

const SidebarItem = ({ icon: Icon, label, path, isActive, onClick, isAdminOnly }: SidebarItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full group",
        isActive 
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-700 hover:text-gray-900 hover:bg-blue-50 hover:scale-105",
        isAdminOnly && "glass-card cosmic-border hover:neon-glow text-purple-100 hover:text-white"
      )}
      onClick={onClick}
    >
      <Icon size={20} className={isAdminOnly ? "group-hover:text-cyan-400 transition-colors" : ""} />
      <span className="font-medium text-base">{label}</span>
      {isAdminOnly && (
        <div className="ml-auto">
          <Star size={16} className="text-purple-400 sparkle" />
        </div>
      )}
    </Link>
  );
};

export function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useTelegramAuth();

  const isAdmin = user?.id === ADMIN_TELEGRAM_ID;

  const routes = [
    { path: "/", label: "Dashboard", icon: BarChart },
    { path: "/inventory", label: "Inventory", icon: Database },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/chat", label: "Chat", icon: MessageSquare },
    { path: "/notifications", label: "Notifications", icon: Bell },
    { path: "/insights", label: "AI Insights", icon: Lightbulb },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const adminRoutes = [
    { path: "/admin", label: "Unicorn Portal", icon: Sparkles, isAdminOnly: true },
  ];

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/95 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-blue-200"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white flex flex-col w-80 transition-all duration-300 md:relative md:w-80 border-r border-gray-200 shadow-xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isAdmin && "cosmic-bg border-purple-500/30"
        )}
      >
        <div className={cn(
          "p-6 border-b border-gray-200 flex items-center h-20",
          isAdmin && "border-purple-500/30"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg text-lg",
              isAdmin && "cosmic-gradient neon-glow floating-animation"
            )}>
              {isAdmin ? "🦄" : "D"}
            </div>
            <h1 className={cn(
              "font-bold text-xl text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
              isAdmin && "cosmic-text text-2xl"
            )}>
              {isAdmin ? "Unicorn Realm" : "Diamond Muzzle"}
            </h1>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {/* Regular routes */}
          {routes.map((route) => (
            <SidebarItem
              key={route.path}
              icon={route.icon}
              label={route.label}
              path={route.path}
              isActive={location.pathname === route.path}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}

          {/* Admin section - only visible to admin */}
          {isAdmin && (
            <>
              <div className="py-4">
                <div className="border-t border-purple-500/30"></div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-2 px-4 py-2 text-purple-300 font-semibold text-sm">
                  <Sparkles size={16} className="sparkle" />
                  <span className="cosmic-text">🦄 COSMIC ADMIN</span>
                </div>
              </div>

              {adminRoutes.map((route) => (
                <SidebarItem
                  key={route.path}
                  icon={route.icon}
                  label={route.label}
                  path={route.path}
                  isActive={location.pathname === route.path}
                  onClick={() => setIsMobileOpen(false)}
                  isAdminOnly={route.isAdminOnly}
                />
              ))}
            </>
          )}
        </nav>

        <div className={cn(
          "p-6 border-t border-gray-200",
          isAdmin && "border-purple-500/30"
        )}>
          {isAdmin && (
            <div className="mb-3 p-3 glass-card rounded-lg cosmic-border pulse-glow">
              <div className="flex items-center gap-2 text-purple-200 text-sm font-medium">
                <Star size={14} className="text-cyan-400" />
                <span>🦄 Unicorn Mode Active</span>
              </div>
            </div>
          )}
          <div className={cn(
            "text-sm text-gray-500 text-center",
            isAdmin && "text-purple-300"
          )}>
            v2.0.0 {isAdmin && "🌟"}
          </div>
        </div>
      </aside>
    </>
  );
}
