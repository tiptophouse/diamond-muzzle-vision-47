import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Sparkles } from 'lucide-react';

export const EmptyNotificationsState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-large">
          <Inbox className="w-12 h-12 text-muted-foreground" />
        </div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-accent" />
        </motion.div>
      </motion.div>

      <h3 className="text-xl font-bold text-foreground mb-2">אין התראות חדשות</h3>
      <p className="text-center text-muted-foreground max-w-xs leading-relaxed">
        כשיהיו קונים שמתעניינים ביהלומים שלך, תקבל כאן התראות
      </p>
    </motion.div>
  );
};
