import { Users, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuctionPresence } from '@/hooks/useAuctionPresence';

interface AuctionPresenceProps {
  auctionId: string;
}

export function AuctionPresence({ auctionId }: AuctionPresenceProps) {
  const { spectators, spectatorCount } = useAuctionPresence(auctionId);

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1 animate-pulse">
        <Eye className="h-3 w-3 text-green-500" />
        <span className="font-semibold">{spectatorCount}</span>
        <Users className="h-3 w-3" />
      </Badge>
      
      {spectatorCount > 0 && (
        <div className="flex -space-x-2">
          {spectators.slice(0, 5).map((spectator, index) => (
            <div
              key={spectator.telegram_id}
              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground border-2 border-background"
              style={{ zIndex: 10 - index }}
              title={spectator.user_name || 'User'}
            >
              {(spectator.user_name || 'U')[0].toUpperCase()}
            </div>
          ))}
          {spectatorCount > 5 && (
            <div
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background"
              style={{ zIndex: 4 }}
            >
              +{spectatorCount - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
