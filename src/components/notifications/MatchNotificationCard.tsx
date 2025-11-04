import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Diamond, 
  CheckSquare, 
  Square,
  Sparkles 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { cn } from '@/lib/utils';

interface DiamondMatch {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  total_price?: number;
  price_per_carat: number;
  cut?: string;
  picture?: string;
}

interface BuyerInfo {
  userId: number;
  name: string;
  telegram_username?: string;
  phone?: string;
}

interface GroupedNotification {
  buyer: BuyerInfo;
  matches: DiamondMatch[];
  searchQuery: any;
  latestTimestamp: string;
  notificationIds: string[];
  read: boolean;
}

interface MatchNotificationCardProps {
  group: GroupedNotification;
  selectedDiamonds: Set<string>;
  onToggleDiamond: (stockNumber: string) => void;
  onSelectAll: (stockNumbers: string[]) => void;
  onClearSelection: () => void;
  onContactBuyer: () => void;
}

export function MatchNotificationCard({
  group,
  selectedDiamonds,
  onToggleDiamond,
  onSelectAll,
  onClearSelection,
  onContactBuyer,
}: MatchNotificationCardProps) {
  const [expanded, setExpanded] = useState(true); // Default to expanded
  const { impactOccurred } = useTelegramHapticFeedback();

  const allStockNumbers = group.matches.map(m => m.stock_number);
  const allSelected = allStockNumbers.length > 0 && allStockNumbers.every(s => selectedDiamonds.has(s));
  const someSelected = selectedDiamonds.size > 0 && !allSelected;
  const selectedCount = selectedDiamonds.size;

  const handleToggle = () => {
    impactOccurred('light');
    setExpanded(!expanded);
  };

  const handleSelectAllToggle = () => {
    impactOccurred('medium');
    if (allSelected) {
      onClearSelection();
    } else {
      onSelectAll(allStockNumbers);
    }
  };

  const formatPrice = (diamond: DiamondMatch) => {
    const price = diamond.total_price || diamond.price_per_carat * diamond.weight;
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const totalValue = Array.from(selectedDiamonds).reduce((sum, stockNumber) => {
    const match = group.matches.find(m => m.stock_number === stockNumber);
    if (!match) return sum;
    return sum + (match.total_price || match.price_per_carat * match.weight);
  }, 0);

  return (
    <Card className={cn(
      "overflow-hidden border transition-all touch-manipulation",
      !group.read ? "border-primary/50 bg-primary/5" : "border-border",
      selectedCount > 0 && "border-primary"
    )}>
      {/* Header with buyer info */}
      <div className={cn(
        "p-3",
        !group.read && "bg-accent/30"
      )}>
        <div className="flex items-start gap-2">
          <Avatar className="h-10 w-10 border border-primary/20 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-base">
              {group.buyer.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {group.buyer.name}
                  </p>
                  {!group.read && (
                    <Badge variant="destructive" className="text-xs px-1 py-0">
                      חדש
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(group.latestTimestamp), { addSuffix: true })}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className="text-xs font-semibold px-1.5 py-0.5 bg-primary/10 text-primary flex-shrink-0"
              >
                {group.matches.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="px-3 py-2 bg-accent/10 border-y border-border/30">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleSelectAllToggle}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors touch-target min-h-[44px]"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : someSelected ? (
              <CheckSquare className="h-4 w-4 text-primary opacity-50" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span className="text-xs">
              {allSelected ? 'בטל הכל' : 'בחר הכל'}
            </span>
          </button>
          
          {selectedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Badge variant="default" className="text-xs px-1.5 py-0.5">
                {selectedCount}
              </Badge>
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                ${totalValue.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Diamond List */}
      <div 
        onClick={handleToggle}
        className="px-3 py-1.5 cursor-pointer hover:bg-accent/30 transition-colors border-t border-border/30 touch-target"
      >
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              הסתר
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              הצג רשימה
            </>
          )}
        </div>
      </div>

      {/* Expanded Diamond List */}
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-border/30">
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-hide">
            {group.matches.map((match, idx) => {
              const isSelected = selectedDiamonds.has(match.stock_number);
              
              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-md p-2 border transition-all touch-target",
                    isSelected 
                      ? "bg-primary/10 border-primary/50" 
                      : "bg-accent/20 border-border/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {
                        impactOccurred('light');
                        onToggleDiamond(match.stock_number);
                      }}
                      className="flex-shrink-0"
                    />
                    
                    {match.picture ? (
                      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-accent">
                        <img 
                          src={match.picture} 
                          alt={match.stock_number}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Diamond className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {match.shape} {match.weight}ct
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {match.color} • {match.clarity}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-xs text-primary">
                        {formatPrice(match)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
