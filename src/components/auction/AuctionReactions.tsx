import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuctionReactions } from '@/hooks/useAuctionReactions';

interface AuctionReactionsProps {
  auctionId: string;
}

const REACTION_EMOJIS: Record<string, string> = {
  fire: '🔥',
  shocked: '😱',
  diamond: '💎',
  clap: '👏',
  eyes: '👀',
};

export function AuctionReactions({ auctionId }: AuctionReactionsProps) {
  const { reactions, reactionCounts, addReaction } = useAuctionReactions(auctionId);

  return (
    <div className="space-y-2">
      {/* Reaction Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(REACTION_EMOJIS) as Array<'fire' | 'shocked' | 'diamond' | 'clap' | 'eyes'>).map((type) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            onClick={() => addReaction(type as 'fire' | 'shocked' | 'diamond' | 'clap' | 'eyes')}
            className="relative"
          >
            <span className="text-lg">{REACTION_EMOJIS[type]}</span>
            {reactionCounts[type] > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {reactionCounts[type]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Floating Reactions Animation */}
      <div className="relative h-20 overflow-hidden">
        {reactions.slice(-10).map((reaction, index) => (
          <div
            key={reaction.id}
            className="absolute animate-float-up"
            style={{
              left: `${(index * 20) % 100}%`,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <span className="text-2xl">{REACTION_EMOJIS[reaction.reaction_type]}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-80px) scale(1.5);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
