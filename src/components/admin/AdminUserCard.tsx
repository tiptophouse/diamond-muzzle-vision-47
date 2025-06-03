
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Phone, Shield, DollarSign } from 'lucide-react';
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
  // Get the display name - prioritize actual names over default
  const getDisplayName = () => {
    if (user.first_name && user.first_name !== 'Telegram' && user.first_name !== 'Test' && user.first_name !== 'Timeout' && user.first_name !== 'Emergency') {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    if (user.username) {
      return `@${user.username}`;
    }
    return `User ${user.telegram_id}`;
  };

  // Get initials for avatar
  const getInitials = () => {
    const displayName = getDisplayName();
    if (displayName.startsWith('@')) {
      return displayName.substring(1, 3).toUpperCase();
    }
    const nameParts = displayName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  // Calculate user cost (API calls + storage + overhead)
  const calculateUserCost = () => {
    const apiCalls = user.api_calls_count || 0;
    const costPerApiCall = 0.002; // $0.002 per API call
    const storageCost = (user.storage_used_mb || 0) * 0.001; // $0.001 per MB
    const totalCost = (apiCalls * costPerApiCall) + storageCost + 0.1; // $0.1 base cost
    return totalCost.toFixed(3);
  };

  return (
    <div 
      className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border transition-all duration-300 hover:border-slate-600 ${
        isBlocked ? 'border-red-600/50 bg-red-900/10' : 'border-slate-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-12 w-12 border-2 border-slate-600">
            <AvatarImage src={user.photo_url} />
            <AvatarFallback className="bg-slate-700 text-slate-300">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-white text-sm sm:text-base truncate">
                {getDisplayName()}
              </span>
              {user.is_premium && <Star className="h-4 w-4 text-yellow-400" />}
              {user.phone_number && <Phone className="h-4 w-4 text-green-400" />}
              {isBlocked && <Shield className="h-4 w-4 text-red-400" />}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400 flex-wrap">
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                ID: {user.telegram_id}
              </Badge>
              {user.username && <span>@{user.username}</span>}
              {user.phone_number && <span className="hidden sm:inline">{user.phone_number}</span>}
              <Badge 
                variant={user.subscription_status === 'premium' ? 'default' : 'secondary'}
                className="bg-slate-700 text-slate-300"
              >
                {user.subscription_status || 'free'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4 flex-1 sm:flex-initial">
            <div className="text-center">
              <div className="text-sm font-medium text-slate-300">{user.total_visits}</div>
              <div className="text-xs text-slate-500">Visits</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-slate-300">{engagementScore}%</div>
              <div className="text-xs text-slate-500">Engagement</div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-slate-300 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {calculateUserCost()}
              </div>
              <div className="text-xs text-slate-500">Cost USD</div>
            </div>
          </div>

          <div className="hidden sm:block text-right text-xs text-slate-500 max-w-[120px]">
            <div>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</div>
            {user.last_active && (
              <div>Active {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</div>
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
