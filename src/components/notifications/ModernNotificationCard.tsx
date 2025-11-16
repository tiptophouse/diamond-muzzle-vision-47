import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Eye, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModernNotificationCardProps {
  buyerName: string;
  buyerId: number;
  diamondCount: number;
  timestamp: string;
  isNew: boolean;
  searchQuery?: string;
  onContact: () => void;
  onViewDetails: () => void;
  onGenerateMessage: () => void;
  className?: string;
}

export const ModernNotificationCard: React.FC<ModernNotificationCardProps> = ({
  buyerName,
  buyerId,
  diamondCount,
  timestamp,
  isNew,
  searchQuery,
  onContact,
  onViewDetails,
  onGenerateMessage,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative bg-card rounded-2xl p-5 border border-border",
        "shadow-soft hover:shadow-medium transition-all duration-300",
        "overflow-hidden group",
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {buyerName}
              </h3>
              {isNew && (
                <Badge className="bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-medium">
                  חדש
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {timestamp}
            </p>
          </div>
          
          {/* Diamond count badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center min-w-[3rem] h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground font-bold text-lg shadow-medium"
          >
            {diamondCount}
          </motion.div>
        </div>

        {/* Search query if available */}
        {searchQuery && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="text-xs text-muted-foreground leading-relaxed" dir="auto">
              {searchQuery}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Primary CTA - Contact */}
          <Button
            onClick={onContact}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-medium hover:shadow-large transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5 ml-2" />
            <span className="flex-1">צור קשר עם הקונה</span>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onGenerateMessage}
              variant="outline"
              className="h-11 border-2 border-border hover:border-accent hover:bg-accent/10 font-medium rounded-xl transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 ml-2" />
              הודעת AI
            </Button>
            <Button
              onClick={onViewDetails}
              variant="outline"
              className="h-11 border-2 border-border hover:border-primary/30 hover:bg-primary/5 font-medium rounded-xl transition-all duration-300"
            >
              <Eye className="w-4 h-4 ml-2" />
              צפה בפרטים
            </Button>
          </div>
        </div>
      </div>

      {/* Animated indicator line */}
      <motion.div
        className="absolute bottom-0 right-0 h-1 bg-gradient-to-l from-primary to-accent rounded-full"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
};
