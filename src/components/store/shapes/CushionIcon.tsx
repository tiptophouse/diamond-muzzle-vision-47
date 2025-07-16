
interface IconProps {
  className?: string;
}

export function CushionIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cushionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="cushionShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2"/>
        </filter>
      </defs>
      <rect 
        x="7" 
        y="7" 
        width="18" 
        height="18" 
        rx="6" 
        ry="6" 
        fill="url(#cushionGradient)"
        filter="url(#cushionShadow)"
      />
      <rect x="10" y="10" width="12" height="12" rx="3" ry="3" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
      <rect x="13" y="13" width="6" height="6" rx="1.5" ry="1.5" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.4"/>
    </svg>
  );
}
