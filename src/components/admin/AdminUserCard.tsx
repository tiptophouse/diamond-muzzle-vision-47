
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Phone, Shield } from 'lucide-react';
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
  return (
    <div 
      className={`glass-card rounded-lg p-3 sm:p-4 transition-all duration-300 hover:neon-glow ${
        isBlocked ? 'border-purple-500/50' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 neon-glow">
            <AvatarImage src={user.photo_url} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
              {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-white text-sm sm:text-base truncate">
                {user.first_name} {user.last_name}
              </span>
              {user.is_premium && <Star className="h-4 w-4 text-yellow-400" />}
              {user.phone_number && <Phone className="h-4 w-4 text-green-400" />}
              {isBlocked && <Shield className="h-4 w-4 text-purple-400" />}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 flex-wrap">
              <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                ID: {user.telegram_id}
              </Badge>
              {user.username && <span>@{user.username}</span>}
              {user.phone_number && <span className="hidden sm:inline">{user.phone_number}</span>}
              <Badge 
                variant={user.subscription_status === 'premium' ? 'default' : 'secondary'}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
              >
                {user.subscription_status || 'free'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4 flex-1 sm:flex-initial">
            <div className="text-center">
              <div className="text-sm font-medium text-cyan-400">{user.total_visits}</div>
              <div className="text-xs text-gray-400">Visits</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-purple-400">{engagementScore}%</div>
              <div className="text-xs text-gray-400">Engagement</div>
            </div>
          </div>

          <div className="hidden sm:block text-right text-xs text-gray-400 max-w-[120px]">
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
