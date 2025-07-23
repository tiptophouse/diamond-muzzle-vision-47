import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WishlistManager } from '@/components/wishlist/WishlistManager';

export default function WishlistPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <WishlistManager />
      </div>
    </Layout>
  );
}