
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex bg-background">
      {/* Mobile-first responsive sidebar */}
      <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out' : 'w-64'} bg-sidebar border-r border-sidebar-border`}>
        <Sidebar />
      </div>
      
      {/* Main content area with mobile padding adjustment */}
      <div className={`flex-1 w-full min-w-0 flex flex-col bg-background ${isMobile ? 'ml-0' : 'ml-0'}`}>
        <Header />
        <main className="flex-1 w-full min-w-0 p-1 sm:p-2 md:p-4 lg:p-6 overflow-x-hidden bg-background">
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
