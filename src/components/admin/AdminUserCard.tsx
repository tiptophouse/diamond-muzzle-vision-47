
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Phone, Shield, AlertCircle, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AdminUserActions } from './AdminUserActions';

interface AdminUserCardProps {
  user: any;
  isBlocked: boolean;
  engagementScore: number;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onToggleBlock: (user: any) => void;
  onDeleteUser: (user: any) => void;
  countryCode?: string | null;
  countryName?: string | null;
}

export function AdminUserCard({ 
  user, 
  isBlocked, 
  engagementScore, 
  onViewUser, 
  onEditUser, 
  onToggleBlock, 
  onDeleteUser,
  countryCode,
  countryName
}: AdminUserCardProps) {
  // Get the real display name from actual data
  const getDisplayName = () => {
    // Check if this is real user data vs mock/placeholder data
    const isRealData = user.first_name && 
      user.first_name.trim() && 
      !['Test', 'Telegram', 'Emergency', 'Unknown'].includes(user.first_name.trim());
    
    if (isRealData) {
      const lastName = user.last_name ? ` ${user.last_name.trim()}` : '';
      return `${user.first_name.trim()}${lastName}`;
    }
    
    // For mock data, try username first
    if (user.username && !user.username.includes('testuser') && !user.username.includes('telegram_user')) {
      return `@${user.username}`;
    }
    
    // Fallback: Show telegram ID with indicator
    return `User ${user.telegram_id}`;
  };

  // Check if this is real user data
  const isRealUserData = () => {
    return user.first_name && 
      user.first_name.trim() && 
      !['Test', 'Telegram', 'Emergency', 'Unknown'].includes(user.first_name.trim());
  };

  // Get initials for avatar
  const getInitials = () => {
    if (isRealUserData() && user.first_name) {
      const lastName = user.last_name || '';
      if (lastName) {
        return `${user.first_name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
      return user.first_name.substring(0, 2).toUpperCase();
    }
    
    if (user.username && !user.username.includes('testuser')) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return 'U?';
  };

  // Get real user status
  const getUserStatus = () => {
    if (isBlocked) return 'Blocked';
    if (user.last_active) {
      const lastActive = new Date(user.last_active);
      const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
      if (hoursSinceActive < 1) return 'Online';
      if (hoursSinceActive < 24) return 'Active Today';
      if (hoursSinceActive < 168) return 'Active This Week';
      return 'Inactive';
    }
    return 'New User';
  };

  const statusColor = () => {
    const status = getUserStatus();
    switch (status) {
      case 'Online': return 'bg-green-500 text-white';
      case 'Active Today': return 'bg-blue-500 text-white';
      case 'Active This Week': return 'bg-yellow-500 text-white';
      case 'Blocked': return 'bg-red-500 text-white';
      case 'New User': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${isBlocked ? 'bg-red-50' : ''}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-12 w-12 border-2 border-gray-200">
            <AvatarImage src={user.photo_url} />
            <AvatarFallback className={`font-semibold ${isRealUserData() ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                {getDisplayName()}
              </span>
              <div className="flex items-center gap-1">
                {countryCode ? (
                  <span className="text-lg" title={countryName || countryCode}>
                    {String.fromCodePoint(
                      0x1F1E6 + (countryCode.toUpperCase().charCodeAt(0) - 65),
                      0x1F1E6 + (countryCode.toUpperCase().charCodeAt(1) - 65)
                    )}
                  </span>
                ) : (
                  <div title="Location unknown">
                    <Globe className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                {countryName && (
                  <span className="text-xs text-gray-600 hidden sm:inline max-w-[80px] truncate">
                    {countryName}
                  </span>
                )}
              </div>
              {!isRealUserData() && <AlertCircle className="h-4 w-4 text-orange-500" />}
              {user.is_premium && <Star className="h-4 w-4 text-yellow-500" />}
              {user.phone_number && <Phone className="h-4 w-4 text-green-500" />}
              {isBlocked && <Shield className="h-4 w-4 text-red-500" />}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
              <Badge variant="outline" className="border-gray-300 text-gray-700">
                ID: {user.telegram_id}
              </Badge>
              {user.username && <span>@{user.username}</span>}
              {user.phone_number && <span className="hidden sm:inline">{user.phone_number}</span>}
              <Badge className={statusColor()}>
                {getUserStatus()}
              </Badge>
              <Badge 
                variant={user.subscription_status === 'premium' ? 'default' : 'secondary'}
                className={user.subscription_status === 'premium' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
              >
                {user.subscription_status || 'free'}
              </Badge>
              {!isRealUserData() && (
                <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                  Mock Data
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6 flex-1 sm:flex-initial">
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-600">{user.total_visits || 0}</div>
              <div className="text-xs text-gray-500">Visits</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-semibold text-purple-600">{engagementScore}%</div>
              <div className="text-xs text-gray-500">Engagement</div>
            </div>

            <div className="text-center hidden sm:block">
              <div className="text-sm font-semibold text-green-600">{user.api_calls_count || 0}</div>
              <div className="text-xs text-gray-500">API Calls</div>
            </div>
          </div>

          <div className="hidden sm:block text-right text-xs text-gray-500 max-w-[120px]">
            <div>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</div>
            {user.last_active && (
              <div>Last seen {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</div>
            )}
          </div>

          <AdminUserActions
            user={user}
            isBlocked={isBlocked}
            onViewUser={onViewUser}
            onEditUser={onEditUser}
            onToggleBlock={onToggleBlock}
            onDeleteUser={onDeleteUser}
          />
        </div>
      </div>
    </div>
  );
}
