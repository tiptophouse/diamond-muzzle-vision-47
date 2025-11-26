import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface AuctionCountdownProps {
  endsAt: string;
  extensionCount?: number;
}

export function AuctionCountdown({ endsAt, extensionCount = 0 }: AuctionCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progress, setProgress] = useState(100);
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'danger'>('normal');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const end = new Date(endsAt);
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('המכרז הסתיים');
        setProgress(0);
        return;
      }

      // Calculate percentage remaining (assuming 1 hour total duration for demo)
      const totalDuration = 60 * 60 * 1000; // 1 hour in ms
      const remaining = Math.min(diff, totalDuration);
      const percent = (remaining / totalDuration) * 100;
      setProgress(percent);

      // Set urgency based on time left
      if (diff < 60 * 1000) { // Less than 1 minute
        setUrgency('danger');
      } else if (diff < 5 * 60 * 1000) { // Less than 5 minutes
        setUrgency('warning');
      } else {
        setUrgency('normal');
      }

      setTimeRemaining(formatDistance(end, now, { addSuffix: true }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const getColorClass = () => {
    switch (urgency) {
      case 'danger':
        return 'text-destructive';
      case 'warning':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getProgressColor = () => {
    switch (urgency) {
      case 'danger':
        return 'bg-destructive';
      case 'warning':
        return 'bg-orange-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 text-sm ${getColorClass()} ${urgency === 'danger' ? 'animate-pulse' : ''}`}>
        <Clock className={`w-4 h-4 ${urgency === 'danger' ? 'animate-spin' : ''}`} />
        <span className="font-semibold">{timeRemaining}</span>
        {extensionCount > 0 && (
          <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
            🔥 הוארך {extensionCount}x
          </span>
        )}
      </div>
      <div className="relative">
        <Progress value={progress} className="h-2" />
        <div 
          className={`absolute top-0 left-0 h-full ${getProgressColor()} rounded-full transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
