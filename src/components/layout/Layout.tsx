
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useState } from "react";
import { Menu, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnhancedTelegramWebApp } from "@/hooks/useEnhancedTelegramWebApp";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { webApp, isInitialized } = useEnhancedTelegramWebApp();
  
  return (
    <div className={cn(
      "min-h-tg-viewport w-full flex bg-background overflow-hidden",
      "ios-viewport relative"
    )}>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      {/* Modern Sidebar - Telegram native design */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
        {/* Mobile Navigation Header */}
        <div className="lg:hidden">
          <div className="flex items-center h-16 px-4 border-b border-border/50 bg-card/60 backdrop-blur-xl">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(true)}
              className="mobile-tap rounded-2xl hover:bg-accent/60 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1 justify-center">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Diamond className="text-primary-foreground h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold text-foreground">BrilliantBot</h1>
            </div>
            
            <div className="w-10" />
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto ios-scroll bg-background/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
