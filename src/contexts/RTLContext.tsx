import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface RTLContextType {
  direction: 'rtl' | 'ltr';
  isRTL: boolean;
  setDirection: (dir: 'rtl' | 'ltr') => void;
  toggleDirection: () => void;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

export function RTLProvider({ children }: { children: ReactNode }) {
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('ltr');
  
  useEffect(() => {
    // Set initial direction to LTR
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', direction === 'rtl' ? 'he' : 'en');
    
    // Update body class for styling
    if (direction === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [direction]);
  
  const toggleDirection = () => {
    setDirection(prev => prev === 'rtl' ? 'ltr' : 'rtl');
  };
  
  const value: RTLContextType = {
    direction,
    isRTL: direction === 'rtl',
    setDirection,
    toggleDirection,
  };
  
  return (
    <RTLContext.Provider value={value}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error('useRTL must be used within RTLProvider');
  }
  return context;
}

// Hook for conditional RTL styling
export function useRTLClass(rtlClass: string, ltrClass: string = '') {
  const { isRTL } = useRTL();
  return isRTL ? rtlClass : ltrClass;
}

// Utility to get direction-aware margin/padding
export function useDirectionClass(property: 'start' | 'end'): 'left' | 'right' {
  const { isRTL } = useRTL();
  
  if (property === 'start') {
    return isRTL ? 'right' : 'left';
  }
  return isRTL ? 'left' : 'right';
}
