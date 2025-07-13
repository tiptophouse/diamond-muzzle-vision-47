
interface IconProps {
  className?: string;
}

export function RadiantIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 hover:rotate-12`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="radiantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="30%" stopColor="currentColor" stopOpacity="0.5"/>
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="radiantShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path 
        d="M10 6h12l4 4v12l-4 4H10l-4-4V10z" 
        fill="url(#radiantGradient)"
        filter="url(#radiantShadow)"
      />
      <path d="M6 10l4-4" stroke="currentColor" strokeWidth="0.4" opacity="0.7"/>
      <path d="M26 10l-4-4" stroke="currentColor" strokeWidth="0.4" opacity="0.7"/>
      <path d="M6 22l4 4" stroke="currentColor" strokeWidth="0.4" opacity="0.7"/>
      <path d="M26 22l-4 4" stroke="currentColor" strokeWidth="0.4" opacity="0.7"/>
      <rect x="12" y="12" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.5"/>
    </svg>
  );
}
