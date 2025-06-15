
import Sidebar from "./Sidebar";
import { Header } from "./Header";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex bg-background">
      {/* Hamburger menu button fixed at top-left on mobile */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-[100] p-2 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar as Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        {/* Mobile header is now only app name and center spacer */}
        <div className="lg:hidden flex items-center justify-center p-4 pt-10 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
          <h1 className="text-lg font-bold text-gray-900">Diamond Muzzle</h1>
        </div>
        {/* SheetContent for Sidebar */}
        <SheetContent
          side="left"
          className="p-0 w-64 h-full z-[70] bg-white border-r border-gray-200"
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 z-50 w-64">
          <Sidebar />
        </div>
      </div>

      {/* Main content area (margin left on desktop for sidebar) */}
      <div className="flex-1 w-full min-w-0 flex flex-col bg-background lg:ml-64">
        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        {/* Main content */}
        <main className="flex-1 w-full min-w-0 p-2 sm:p-4 md:p-6 overflow-x-hidden bg-background pt-24 lg:pt-0">
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

