import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationSkeletonProps {
  count?: number;
}

export function NotificationSkeleton({ count = 3 }: NotificationSkeletonProps) {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              
              <div className="flex-1 space-y-2 min-w-0">
                {/* Title */}
                <Skeleton className="h-4 w-3/4" />
                
                {/* Subtitle */}
                <Skeleton className="h-3 w-1/2" />
                
                {/* Content */}
                <div className="space-y-1.5 mt-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
                
                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>
              
              {/* Badge */}
              <Skeleton className="h-5 w-12 rounded-full flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
