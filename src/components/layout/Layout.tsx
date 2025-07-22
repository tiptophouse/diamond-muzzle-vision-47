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
  return <div className="min-h-screen w-full overflow-x-hidden flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Sidebar - hidden on mobile, slide in when open */}
      <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} data-tutorial="sidebar">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 w-full min-w-0 flex flex-col bg-background lg:ml-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden flex items-center justify-between h-14 sm:h-16 sm:px-4 border-b border-border/20 bg-card/50 backdrop-blur-md px-0 mx-0 py-[70px] my-[45px]">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-accent/50 transition-colors min-w-[44px] min-h-[44px] my-0 px-[40px] py-[50px]">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">💎</span>
            </div>
            <h1 className="font-semibold text-foreground text-base sm:text-lg tracking-tight truncate">
              Diamond Mazal
            </h1>
          </div>
          
          <div className="w-11 sm:w-9 flex-shrink-0" />
        </div>
        
        {/* Desktop header */}
        <div className="hidden lg:block">
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

      {/* Tutorial Modal */}
      <TutorialModal />
    </div>;
}