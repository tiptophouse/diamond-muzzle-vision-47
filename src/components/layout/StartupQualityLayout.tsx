import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StartupQualityLayoutProps {
  children: ReactNode;
  className?: string;
  level?: 'standard' | 'premium' | 'enterprise';
}

export function StartupQualityLayout({ 
  children, 
  className = "",
  level = 'premium'
}: StartupQualityLayoutProps) {
  const qualityClasses = {
    standard: "transition-all duration-200",
    premium: "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
    enterprise: "transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl"
  };

  return (
    <div className={cn(
      "startup-quality",
      qualityClasses[level],
      className
    )}>
      {children}
    </div>
  );
}