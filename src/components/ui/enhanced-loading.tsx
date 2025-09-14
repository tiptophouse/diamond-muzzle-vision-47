/**
 * Enhanced Loading Components with better UX
 * Provides skeleton screens and loading states
 */

import React from 'react';
import { Diamond, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

interface DiamondLoadingProps {
  className?: string;
  text?: string;
  pulseCount?: number;
}

export function DiamondLoading({ className, text = "Loading diamonds...", pulseCount = 3 }: DiamondLoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4 py-8", className)}>
      <div className="relative">
        {/* Main diamond icon */}
        <Diamond className="w-12 h-12 text-primary animate-pulse" />
        
        {/* Animated sparkles */}
        <Sparkles className="w-4 h-4 text-primary/60 absolute -top-1 -right-1 animate-ping" />
        <Sparkles className="w-3 h-3 text-primary/40 absolute -bottom-1 -left-1 animate-ping" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Pulse dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: pulseCount }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      
      {text && (
        <p className="text-sm text-muted-foreground text-center">{text}</p>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className, rounded = false }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-muted",
        rounded ? "rounded-full" : "rounded-md",
        className
      )} 
    />
  );
}

export function DiamondCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm animate-pulse">
      <div className="space-y-3">
        {/* Image placeholder */}
        <Skeleton className="aspect-square w-full rounded-lg" />
        
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* Price */}
        <Skeleton className="h-5 w-1/2" />
        
        {/* Details */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        
        {/* Action button */}
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function DiamondGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DiamondCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface PageLoadingProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

export function PageLoading({ 
  title = "Loading...", 
  subtitle, 
  showLogo = true, 
  className 
}: PageLoadingProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center px-6", className)}>
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        {showLogo && (
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-muted animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Diamond className="w-8 h-8 text-primary" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "Please try again later", 
  retry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6", className)}>
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        {retry && (
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Loader2 className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}