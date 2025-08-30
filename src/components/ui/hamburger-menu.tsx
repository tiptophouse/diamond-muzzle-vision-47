import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HamburgerMenuProps {
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'blue' | 'primary';
}

export function HamburgerMenu({ 
  isOpen = false, 
  onClick, 
  className,
  size = 'lg',
  variant = 'blue'
}: HamburgerMenuProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 p-1',
    md: 'h-8 w-8 p-1.5', 
    lg: 'h-12 w-12 p-2'
  };

  const variantClasses = {
    default: 'text-foreground hover:text-primary',
    blue: 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100',
    primary: 'text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200',
        'active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        'min-h-[44px] min-w-[44px]', // Touch-friendly size
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <Menu 
        className={cn(
          'transition-transform duration-200',
          isOpen && 'rotate-90'
        )}
        strokeWidth={2}
      />
    </button>
  );
}