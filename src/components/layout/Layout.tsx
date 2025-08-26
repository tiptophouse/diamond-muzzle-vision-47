
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useState } from "react";
import { Menu, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({
  children
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hapticFeedback } = useTelegramWebApp();
  
  const handleMenuClick = () => {
    hapticFeedback.impact('light');
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    hapticFeedback.impact('light');
    setSidebarOpen(false);
  };
  
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
          onClick={handleSidebarClose} 
        />
      )}
      
      {/* Sidebar - always available, slide in when open on mobile */}
      <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
        <Sidebar />
      </div>
      
      <div className="flex-1 w-full min-w-0 flex flex-col bg-background">
        {/* Mobile header with menu button - always visible */}
        <div className="lg:hidden flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 border-b border-border/20 bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMenuClick} 
            className="p-2 rounded-xl hover:bg-accent/50 transition-colors min-w-[44px] min-h-[44px]"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center shadow-sm flex-shrink-0">
              <Diamond className="text-white h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <h1 className="font-semibold text-foreground text-base sm:text-lg tracking-tight truncate">
              BrilliantBot
            </h1>
          </div>
          
          <div className="w-11 sm:w-9 flex-shrink-0" />
        </div>
        
        {/* Desktop header - always visible */}
        <div className="hidden lg:block sticky top-0 z-30">
          <Header />
        </div>
        
        <main className="flex-1 w-full min-w-0 overflow-x-hidden bg-background">
          <div className="w-full max-w-full h-full p-3 sm:p-4 lg:p-6">
            <div className="w-full max-w-none overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
