
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
  Bell
} from "lucide-react";
import { useState } from "react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, path, isActive, onClick }: SidebarItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full",
        isActive 
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-700 hover:text-gray-900 hover:bg-blue-50 hover:scale-105"
      )}
      onClick={onClick}
    >
      <Icon size={20} />
      <span className="font-medium text-base">{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-gray-200 flex items-center h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg text-lg">
              D
            </div>
            <h1 className="font-bold text-xl text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Diamond Muzzle
            </h1>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
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
        </nav>

        <div className="p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            v2.0.0
          </div>
        </div>
      </aside>
    </>
  );
}
