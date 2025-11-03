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
  const [expanded, setExpanded] = useState(false);
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
      "overflow-hidden border-2 transition-all",
      !group.read ? "border-primary/40 shadow-lg" : "border-border shadow-md",
      selectedCount > 0 && "ring-2 ring-primary/50"
    )}>
      {/* Header with buyer info */}
      <div className={cn(
        "p-4",
        !group.read ? "bg-gradient-to-r from-primary/10 to-accent/10" : "bg-gradient-to-r from-primary/5 to-accent/5"
      )}>
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
              {group.buyer.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base text-foreground truncate">
                    {group.buyer.name}
                  </p>
                  {!group.read && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
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
                className="text-sm font-bold px-2 py-1 bg-primary/10 text-primary border-primary/20 flex-shrink-0"
              >
                {group.matches.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs mt-2">
              <Diamond className="h-3 w-3 text-primary" />
              <span className="font-semibold text-foreground">
                {group.matches.length} יהלומים מתאימים
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="px-4 py-3 bg-accent/20 border-y border-border/50">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleSelectAllToggle}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : someSelected ? (
              <CheckSquare className="h-4 w-4 text-primary opacity-50" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span>
              {allSelected ? 'בטל הכל' : 'בחר הכל'}
            </span>
          </button>
          
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {selectedCount} נבחרו
              </Badge>
              <Badge variant="outline" className="text-xs">
                ${totalValue.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Contact Button */}
      <div className="px-4 py-3">
        <Button
          size="lg"
          onClick={onContactBuyer}
          disabled={selectedCount === 0}
          className="w-full h-11 text-sm font-semibold gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
        >
          <Sparkles className="h-4 w-4" />
          צור הודעה עם AI
          {selectedCount > 0 && <Badge variant="secondary" className="mr-2">{selectedCount}</Badge>}
        </Button>
      </div>

      {/* Toggle Diamond List */}
      <div 
        onClick={handleToggle}
        className="px-4 py-2 cursor-pointer hover:bg-accent/50 transition-colors border-t border-border/50"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              הסתר רשימת יהלומים
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              הצג רשימת יהלומים
            </>
          )}
        </div>
      </div>

      {/* Expanded Diamond List */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {group.matches.map((match, idx) => {
              const isSelected = selectedDiamonds.has(match.stock_number);
              
              return (
                <div
                  key={idx}
                  onClick={() => onToggleDiamond(match.stock_number)}
                  className={cn(
                    "rounded-lg p-3 border transition-all cursor-pointer",
                    isSelected 
                      ? "bg-primary/10 border-primary/40 shadow-md" 
                      : "bg-accent/30 border-border/30 hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleDiamond(match.stock_number)}
                      className="flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {match.picture ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
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
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Diamond className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        {match.shape} {match.weight}ct
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.color} • {match.clarity} {match.cut && `• ${match.cut}`}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        #{match.stock_number}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm text-primary">
                        {formatPrice(match)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${match.price_per_carat.toLocaleString()}/ct
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
