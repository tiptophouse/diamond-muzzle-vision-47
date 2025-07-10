import Sidebar from "./Sidebar";
import { Header } from "./Header";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({
  children
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex bg-background" 
         style={{ 
           paddingTop: 'env(safe-area-inset-top)', 
           paddingBottom: 'env(safe-area-inset-bottom)',
           height: 'var(--tg-viewport-height, 100vh)'
         }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar - slide from LEFT instead of right */}
      <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} 
        data-tutorial="sidebar"
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          height: 'var(--tg-viewport-height, 100vh)'
        }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 w-full min-w-0 flex flex-col bg-background lg:ml-0">
        {/* Mobile header with menu button - touch-friendly */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 premium-card"
             style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSidebarOpen(true)} 
            className="p-3 rounded-xl min-h-[44px] min-w-[44px] btn-touch"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">💎</span>
            </div>
            <h1 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-lg sm:text-xl">
              Diamond mazal
            </h1>
          </div>
          
          <div className="w-[44px]" /> {/* Spacer for balance */}
        </div>
        
        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        <main className="flex-1 w-full min-w-0 overflow-x-hidden bg-background"
              style={{ 
                padding: 'clamp(0.5rem, 2vw, 1.5rem)',
                paddingLeft: 'max(clamp(0.5rem, 2vw, 1.5rem), env(safe-area-inset-left))',
                paddingRight: 'max(clamp(0.5rem, 2vw, 1.5rem), env(safe-area-inset-right))'
              }}>
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* Tutorial Modal */}
      <TutorialModal />
    </div>
  );
}