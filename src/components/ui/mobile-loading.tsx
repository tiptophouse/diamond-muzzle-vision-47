import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function MobileLoading({ 
  size = 'md', 
  text = 'Loading...', 
  className 
}: MobileLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6 md:h-8 md:w-8',
    lg: 'h-8 w-8 md:h-12 md:w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm md:text-base',
    lg: 'text-base md:text-lg'
  };

  return (
    <div className={cn(
      "flex items-center justify-center gap-2 md:gap-3 py-4 md:py-6", 
      className
    )}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <span className={cn("text-muted-foreground", textSizeClasses[size])}>
        {text}
      </span>
    </div>
  );
}