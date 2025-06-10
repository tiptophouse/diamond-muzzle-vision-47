
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Package,
  Upload,
  MessageSquare,
  Settings,
  User,
  Menu,
  X,
  Home,
  Store,
  Archive,
  Shield,
  Bell,
  FileText,
  TrendingUp,
  Plus,
  Boxes,
} from "lucide-react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Button } from "@/components/ui/button";

const ADMIN_IDS = [101, 7508262779];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useTelegramAuth();

  const isAdmin = user && ADMIN_IDS.includes(user.id);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Store", href: "/store", icon: Store },
    { name: "Archive", href: "/archive", icon: Archive },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Single Stone", href: "/upload-single", icon: Plus },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Insights", href: "/insights", icon: TrendingUp },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "MCP", href: "/mcp", icon: Boxes },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const adminNavigation = [
    { name: "Admin Panel", href: "/admin", icon: Shield },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const NavItem = ({ item }: { item: any }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        onClick={() => setIsOpen(false)}
        className={`
          group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
          ${isActive
            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        <item.icon 
          className={`
            mr-3 h-5 w-5 transition-colors duration-200
            ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}
          `} 
        />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:shadow-lg
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Diamond Hub
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
            
            {isAdmin && (
              <>
                <div className="my-4 border-t border-slate-200 pt-4">
                  <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Admin
                  </p>
                </div>
                {adminNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </>
            )}
          </nav>

          {/* User info */}
          {user && (
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    ID: {user.id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
