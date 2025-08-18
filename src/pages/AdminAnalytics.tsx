
import React from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminUserManager } from '@/components/admin/AdminUserManager';

export default function AdminAnalytics() {
  return (
    <AdminGuard>
      <AdminUserManager />
    </AdminGuard>
  );
}
