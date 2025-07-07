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
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Sidebar - hidden on mobile, slide in when open */}
      <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} data-tutorial="sidebar">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 w-full min-w-0 flex flex-col bg-background lg:ml-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 premium-card">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">💎</span>
            </div>
            <h1 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-xl">Diamond mazal</h1>
          </div>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>
        
        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        <main className="flex-1 w-full min-w-0 p-2 sm:p-4 md:p-6 overflow-x-hidden bg-background">
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* Tutorial Modal */}
      <TutorialModal />
    </div>;
}