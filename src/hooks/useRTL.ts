import { useContext } from 'react';
import { useRTL as useRTLContext } from '@/contexts/RTLContext';

// Re-export for convenience
export { useRTL, useRTLClass, useDirectionClass } from '@/contexts/RTLContext';

// Additional RTL utilities
export function useRTLTransform(transform: string): string {
  const { isRTL } = useRTLContext();
  
  if (!isRTL) return transform;
  
  // Flip translateX values for RTL
  return transform.replace(/translateX\((-?\d+(?:\.\d+)?)(px|rem|em|%)\)/g, (match, value, unit) => {
    return `translateX(${-parseFloat(value)}${unit})`;
  });
}

// Get RTL-aware positioning
export function useRTLPosition(position: 'left' | 'right'): 'left' | 'right' {
  const { isRTL } = useRTLContext();
  
  if (!isRTL) return position;
  
  return position === 'left' ? 'right' : 'left';
}

// Conditional class names based on RTL
export function rtlClass(rtlClassName: string, ltrClassName: string = ''): string {
  const direction = document.documentElement.getAttribute('dir') || 'rtl';
  return direction === 'rtl' ? rtlClassName : ltrClassName;
}
