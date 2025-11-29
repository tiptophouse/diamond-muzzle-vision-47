import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardAnimatedProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ children, className }: DashboardAnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

export function DashboardShimmer() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-3"
        >
          <div className="h-24 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg animate-shimmer" />
        </motion.div>
      ))}
    </div>
  );
}

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export function DashboardErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.3 }}
      className="p-4"
    >
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-sm font-medium">Error Loading Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
