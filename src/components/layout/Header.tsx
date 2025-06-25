import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { MainNav } from '@/components/layout/MainNav';
import { MobileNav } from '@/components/layout/MobileNav';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Skeleton } from "@/components/ui/skeleton"
import { GIAScannerButton } from '@/components/gia/GIAScannerButton';

export function Header() {
  const { theme } = useTheme();
  const { user, isLoading } = useTelegramAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <a href="#" className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-64">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate through the application.
                </SheetDescription>
              </SheetHeader>
              <MobileNav />
            </SheetContent>
          </Sheet>
        </a>
        <a href="#" className="font-bold">
          Diamond Inventory
        </a>
      </div>

      <nav className="hidden md:flex items-center space-x-6">
        <MainNav />
      </nav>

      <div className="flex items-center gap-2">
        <GIAScannerButton 
          variant="outline" 
          size="sm"
          onScanResult={(result) => {
            console.log('Header GIA scan result:', result);
            // Handle scan result if needed
          }}
        />
        
        <ModeToggle />
        {isLoading ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : user ? (
          <Avatar>
            <AvatarImage src={user.photo_url} alt={user.first_name} />
            <AvatarFallback>{user.first_name?.charAt(0)}{user.last_name?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <Button size="sm">Login</Button>
        )}
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden p-2">
            <Avatar>
              {isLoading ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : user ? (
                <>
                  <AvatarImage src={user.photo_url} alt={user.first_name} />
                  <AvatarFallback>{user.first_name?.charAt(0)}{user.last_name?.charAt(0)}</AvatarFallback>
                </>
              ) : (
                <AvatarFallback>Login</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-64">
          <SheetHeader className="text-left">
            <SheetTitle>User Profile</SheetTitle>
            <SheetDescription>
              Manage your account settings.
            </SheetDescription>
          </SheetHeader>
          {/* Add user profile settings here */}
        </SheetContent>
      </Sheet>
    </header>
  );
}
