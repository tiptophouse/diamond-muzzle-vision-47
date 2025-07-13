import { Users } from 'lucide-react';
import { useRealTimeUserCount } from '@/hooks/useRealTimeUserCount';

export function RealTimeUserCount() {
  const { userCount, onlineUsers } = useRealTimeUserCount();

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0088cc]/10 rounded-full flex items-center justify-center">
          <Users className="h-5 w-5 text-[#0088cc]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">
              {userCount} {userCount === 1 ? 'user' : 'users'} online
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Live count</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#0088cc]">{userCount}</div>
        </div>
      </div>
      
      {userCount > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Active users:</div>
          <div className="flex flex-wrap gap-1">
            {onlineUsers.slice(0, 5).map((user) => (
              <div
                key={user.user_id}
                className="px-2 py-1 bg-[#0088cc]/10 text-[#0088cc] text-xs rounded-full"
              >
                {user.first_name}
              </div>
            ))}
            {userCount > 5 && (
              <div className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                +{userCount - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}