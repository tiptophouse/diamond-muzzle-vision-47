import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  maxLength?: number;
  title?: string;
}

export function ResponsiveText({ 
  children, 
  className = "", 
  maxLength = 20,
  title 
}: ResponsiveTextProps) {
  const text = typeof children === 'string' ? children : String(children);
  const truncatedText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  
  return (
    <span 
      className={cn(
        "premium-text-fit",
        className
      )}
      title={title || (text.length > maxLength ? text : undefined)}
    >
      {truncatedText}
    </span>
  );
}