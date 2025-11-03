import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Diamond, 
  Send, 
  Sparkles, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  Eye,
  MessageSquare,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface PremiumNotificationCardProps {
  notification: {
    id: string;
    buyer: {
      name: string;
      telegram_id: number;
      username?: string;
    };
    matches: any[];
    totalValue: number;
    created_at: string;
    read: boolean;
    status?: 'pending' | 'sent' | 'viewed' | 'responded';
  };
  onGenerateResponse: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
}

export function PremiumNotificationCard({
  notification,
  onGenerateResponse,
  onMarkAsRead,
  onDismiss
}: PremiumNotificationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'sent':
        return { 
          icon: Send, 
          color: 'text-blue-600 bg-blue-50 dark:bg-blue-950', 
          label: 'נשלח' 
        };
      case 'viewed':
        return { 
          icon: Eye, 
          color: 'text-purple-600 bg-purple-50 dark:bg-purple-950', 
          label: 'נצפה' 
        };
      case 'responded':
        return { 
          icon: MessageSquare, 
          color: 'text-green-600 bg-green-50 dark:bg-green-950', 
          label: 'הגיב' 
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-orange-600 bg-orange-50 dark:bg-orange-950', 
          label: 'ממתין' 
        };
    }
  };

  const statusConfig = getStatusConfig(notification.status);
  const StatusIcon = statusConfig.icon;
  const firstLetter = notification.buyer.name.charAt(0).toUpperCase();

  return (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-300 
        ${isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm'}
        ${notification.read ? 'bg-background' : 'bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      )}

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                {firstLetter}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-base text-foreground truncate">
                  {notification.buyer.name}
                </h3>
                <Badge variant="outline" className={`${statusConfig.color} border-0 text-xs`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true, 
                  locale: he 
                })}
              </p>
            </div>
          </div>

          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onDismiss(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <Diamond className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">יהלומים תואמים</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{notification.matches.length}</p>
          </div>

          <div className="bg-card rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">שווי כולל</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${(notification.totalValue / 1000).toFixed(1)}K
            </p>
          </div>
        </div>

        {/* Quick Preview - Top 3 Diamonds */}
        <div className="space-y-2">
          {notification.matches.slice(0, 3).map((match, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              {match.picture ? (
                <div className="w-10 h-10 rounded bg-background overflow-hidden flex-shrink-0">
                  <img 
                    src={match.picture} 
                    alt={match.stock}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Diamond className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {match.shape} {match.weight}ct
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.color} • {match.clarity}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">
                ${((match.price_per_carat * match.weight) / 1000).toFixed(1)}K
              </p>
            </div>
          ))}
          
          {notification.matches.length > 3 && (
            <p className="text-xs text-center text-muted-foreground">
              +{notification.matches.length - 3} יהלומים נוספים
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {notification.status === 'pending' && (
            <Button
              onClick={() => onGenerateResponse(notification.id)}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              צור תגובה AI
            </Button>
          )}
          
          {notification.status === 'sent' && (
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              disabled
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              הודעה נשלחה
            </Button>
          )}

          {!notification.read && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onMarkAsRead(notification.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              סמן כנקרא
            </Button>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      {isHovered && !notification.read && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      )}
    </Card>
  );
}
