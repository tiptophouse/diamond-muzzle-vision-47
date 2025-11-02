import { useState } from 'react';

interface DiamondInfo {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  price_per_carat: number;
  cut?: string;
  picture?: string;
}

interface ContactBuyerState {
  open: boolean;
  buyerId: number | null;
  buyerName: string;
  notificationId: string;
  diamonds: DiamondInfo[];
  searchQuery?: string;
}

export function useContactBuyer() {
  const [state, setState] = useState<ContactBuyerState>({
    open: false,
    buyerId: null,
    buyerName: '',
    notificationId: '',
    diamonds: [],
  });

  const openContactDialog = (params: {
    buyerId: number;
    buyerName: string;
    notificationId: string;
    diamonds: DiamondInfo[];
    searchQuery?: string;
  }) => {
    setState({
      open: true,
      ...params,
    });
  };

  const closeContactDialog = () => {
    setState({
      open: false,
      buyerId: null,
      buyerName: '',
      notificationId: '',
      diamonds: [],
    });
  };

  return {
    ...state,
    openContactDialog,
    closeContactDialog,
  };
}
