
import React from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { WishlistContent } from '@/components/wishlist/WishlistContent';

const WishlistPage = () => {
  return (
    <TelegramMiniAppLayout>
      <WishlistContent />
    </TelegramMiniAppLayout>
  );
};

export default WishlistPage;
