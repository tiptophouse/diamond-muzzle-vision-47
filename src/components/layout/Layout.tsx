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
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border/20 bg-card/50 backdrop-blur-md my-[40px]">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-accent/50 transition-colors">
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">💎</span>
            </div>
            <h1 className="font-semibold text-foreground text-lg tracking-tight">
              Diamond Mazal
            </h1>
          </div>
          
          <div className="w-9" />
        </div>
        
        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        <main className="flex-1 w-full min-w-0 overflow-x-hidden bg-background">
          <div className="w-full max-w-full h-full p-4 lg:p-6">
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