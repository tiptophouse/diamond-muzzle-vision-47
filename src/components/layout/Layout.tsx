
import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isTelegramEnvironment } = useTelegramAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar for larger screens */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          {/* Main content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
