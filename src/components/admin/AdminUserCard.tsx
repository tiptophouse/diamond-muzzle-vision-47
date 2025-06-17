
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Phone, Shield, AlertCircle, Clock, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserActionButtons } from './UserActionButtons';

interface AdminUserCardProps {
  user: any;
  isBlocked: boolean;
  engagementScore: number;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onToggleBlock: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export function AdminUserCard({ 
  user, 
  isBlocked, 
  engagementScore, 
  onViewUser, 
  onEditUser, 
  onToggleBlock, 
  onDeleteUser 
}: AdminUserCardProps) {
  // Get the real display name from actual data
  const getDisplayName = () => {
    if (user.first_name && user.first_name.trim()) {
      const lastName = user.last_name ? ` ${user.last_name.trim()}` : '';
      return `${user.first_name.trim()}${lastName}`;
    }
    
    if (user.username) {
      return `@${user.username}`;
    }
    
    return `User ${user.telegram_id}`;
  };

  // Get initials for avatar
  const getInitials = () => {
    if (user.first_name && user.first_name.trim()) {
      const lastName = user.last_name || '';
      if (lastName) {
        return `${user.first_name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
      return user.first_name.substring(0, 2).toUpperCase();
    }
    
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return 'U?';
  };

  // Get user status with last activity
  const getUserStatus = () => {
    if (isBlocked) return { status: 'Blocked', color: 'bg-red-500 text-white' };
    
    if (user.last_active) {
      const lastActive = new Date(user.last_active);
      const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceActive < 1) return { status: 'Online', color: 'bg-green-500 text-white' };
      if (hoursSinceActive < 24) return { status: 'Active Today', color: 'bg-blue-500 text-white' };
      if (hoursSinceActive < 168) return { status: 'Active This Week', color: 'bg-yellow-500 text-white' };
      return { status: 'Inactive', color: 'bg-gray-500 text-white' };
    }
    
    return { status: 'New User', color: 'bg-purple-500 text-white' };
  };

  const { status, color } = getUserStatus();

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${isBlocked ? 'bg-red-50' : ''}`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* User Info Section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-12 w-12 border-2 border-gray-200">
            <AvatarImage src={user.photo_url} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                {getDisplayName()}
              </span>
              {user.is_premium && <Star className="h-4 w-4 text-yellow-500" />}
              {user.phone_number && <Phone className="h-4 w-4 text-green-500" />}
              {isBlocked && <Shield className="h-4 w-4 text-red-500" />}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
              <Badge variant="outline" className="border-gray-300 text-gray-700">
                ID: {user.telegram_id}
              </Badge>
              {user.username && <span>@{user.username}</span>}
              <Badge className={color}>
                {status}
              </Badge>
              <Badge 
                variant={user.subscription_status === 'premium' ? 'default' : 'secondary'}
                className={user.subscription_status === 'premium' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
              >
                {user.subscription_status || 'free'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <div className="grid grid-cols-3 gap-4 sm:flex sm:gap-6 flex-1 lg:flex-initial">
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-600">{user.total_visits || 0}</div>
              <div className="text-xs text-gray-500">Visits</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-semibold text-green-600">{user.api_calls_count || 0}</div>
              <div className="text-xs text-gray-500">API Calls</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-semibold text-purple-600">{engagementScore}%</div>
              <div className="text-xs text-gray-500">Engagement</div>
            </div>
          </div>

          {/* Last Activity */}
          <div className="hidden lg:block text-right text-xs text-gray-500 max-w-[120px]">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3" />
              <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
            </div>
            {user.last_active && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>Active {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <UserActionButtons
            user={user}
            isBlocked={isBlocked}
            onViewUser={onViewUser}
            onEditUser={onEditUser}
            onToggleBlock={onToggleBlock}
            onDeleteUser={onDeleteUser}
          />
        </div>
      </div>

      {/* Mobile Last Activity */}
      <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
          </div>
          {user.last_active && (
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>Active {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
