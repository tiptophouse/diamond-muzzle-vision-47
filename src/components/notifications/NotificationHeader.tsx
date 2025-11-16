import React from 'react';
import { motion } from 'framer-motion';
import { Bell, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationHeaderProps {
  totalNotifications: number;
  unreadCount: number;
  totalDiamonds: number;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  totalNotifications,
  unreadCount,
  totalDiamonds,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm border-b border-border/50 pb-4">
      {/* Title section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-medium">
              <Bell className="w-6 h-6 text-primary-foreground" />
            </div>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center shadow-medium"
              >
                {unreadCount}
              </motion.div>
            )}
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">התראות</h1>
            <p className="text-sm text-muted-foreground">התאמות יהלומים חדשות</p>
          </div>
        </div>

        <Button
          onClick={onRefresh}
          variant="outline"
          size="icon"
          disabled={isRefreshing}
          className="w-11 h-11 rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <div className="text-2xl font-bold text-primary mb-0.5">{totalNotifications}</div>
          <div className="text-xs text-muted-foreground font-medium">קונים</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20"
        >
          <div className="text-2xl font-bold text-accent mb-0.5">{totalDiamonds}</div>
          <div className="text-xs text-muted-foreground font-medium">יהלומים</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20"
        >
          <div className="text-2xl font-bold text-success mb-0.5">{unreadCount}</div>
          <div className="text-xs text-muted-foreground font-medium">חדשות</div>
        </motion.div>
      </div>
    </div>
  );
};
