import { Bell, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
export function Header() {
  const {
    user
  } = useTelegramAuth();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const {
    notifications
  } = useNotifications();
  const navigate = useNavigate();
  const userInitials = user ? `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase() : 'DM';
  const displayName = user ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 'Diamond Muzzle';
  const unreadNotifications = notifications.filter(n => !n.read).length;
  return <header className="h-16 border-b border-diamond-200 dark:border-gray-700 flex items-center justify-between px-4 bg-gradient-to-r from-white to-diamond-50 dark:from-gray-900 dark:to-gray-800 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-diamond-600 to-diamond-700 bg-clip-text text-transparent px-[45px]">mazal-bot</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:scale-110">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="relative text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:scale-110">
          <Bell size={20} />
          {unreadNotifications > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 animate-pulse">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </Badge>}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:scale-110 transition-all duration-200">
              <Avatar className="h-8 w-8 ring-2 ring-diamond-200 dark:ring-gray-600">
                {user?.photo_url && <AvatarImage src={user.photo_url} alt={displayName} />}
                <AvatarFallback className="bg-gradient-to-r from-diamond-500 to-diamond-600 text-white font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                {user?.username && <p className="text-xs leading-none text-muted-foreground">
                    @{user.username}
                  </p>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
              Close App
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>;
}