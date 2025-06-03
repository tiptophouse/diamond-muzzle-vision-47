
import React from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { LightweightAdminManager } from '@/components/admin/LightweightAdminManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const AdminAnalytics = () => {
  return (
    <ErrorBoundary>
      <AdminGuard>
        <LightweightAdminManager />
      </AdminGuard>
    </ErrorBoundary>
  );
};

export default AdminAnalytics;
