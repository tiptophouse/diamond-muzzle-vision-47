import { Users } from 'lucide-react';
import { useAllUsers } from '@/hooks/useAllUsers';
import { useEffect, useState } from 'react';

export function ElegantMemberCount() {
  const { allUsers, isLoading, getUserStats } = useAllUsers();
  const [animatedCount, setAnimatedCount] = useState(0);
  const stats = getUserStats();
  
  // Animate the count when it changes
  useEffect(() => {
    if (!isLoading && stats.totalUsers > 0) {
      const timer = setTimeout(() => {
        setAnimatedCount(stats.totalUsers);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stats.totalUsers, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground/60">
        <div className="w-4 h-4 bg-muted-foreground/20 rounded-full animate-pulse"></div>
        <div className="w-8 h-3 bg-muted-foreground/20 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground/80">
      <div className="relative">
        <Users className="h-4 w-4" />
        {stats.activeUsers > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-medium tabular-nums">
          {animatedCount.toLocaleString()}
        </span>
        <span className="text-xs opacity-60">members</span>
      </div>
    </div>
  );
}