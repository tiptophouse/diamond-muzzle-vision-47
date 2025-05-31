
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function Header() {
  const { user } = useTelegramAuth();
  
  const userInitials = user ? 
    `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase() : 
    'DM';
    
  const displayName = user ? 
    `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 
    'Diamond Muzzle';

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 px-[45px]">Diamond Muzzle</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-800">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-diamond-500"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {user?.photo_url && (
                  <AvatarImage src={user.photo_url} alt={displayName} />
                )}
                <AvatarFallback className="bg-diamond-100 text-diamond-700">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                {user?.username && (
                  <p className="text-xs leading-none text-muted-foreground">
                    @{user.username}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Close App</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
