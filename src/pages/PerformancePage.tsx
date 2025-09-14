import React from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

export default function PerformancePage() {
  return (
    <TelegramMiniAppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Performance Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Real-time performance metrics and optimization status
          </p>
        </div>
        
        <PerformanceDashboard />
      </div>
    </TelegramMiniAppLayout>
  );
}