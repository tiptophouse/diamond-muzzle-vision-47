
import React from 'react';
import { UserLookup } from '@/components/admin/UserLookup';
import { AdminGuard } from '@/components/admin/AdminGuard';

export default function UserLookupPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <UserLookup />
      </div>
    </AdminGuard>
  );
}
