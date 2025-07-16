
interface IconProps {
  className?: string;
}

export function OvalIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 drop-shadow-lg`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="ovalDiamondGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
          <stop offset="30%" stopColor="#fef3c7" stopOpacity="0.8"/>
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.9"/>
        </radialGradient>
        <filter id="ovalDiamondShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.4"/>
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      {/* Main diamond body */}
      <ellipse 
        cx="16" 
        cy="16" 
        rx="12" 
        ry="9" 
        fill="url(#ovalDiamondGradient)"
        filter="url(#ovalDiamondShadow)"
        className="animate-pulse"
        style={{ animationDuration: '3.5s' }}
      />
      
      {/* Facet lines */}
      <g stroke="#ffffff" strokeWidth="0.4" opacity="0.7">
        <ellipse cx="16" cy="16" rx="10" ry="7.5" fill="none"/>
        <ellipse cx="16" cy="16" rx="7" ry="5.25" fill="none"/>
        <ellipse cx="16" cy="16" rx="4" ry="3" fill="none"/>
        <line x1="16" y1="7" x2="16" y2="25"/>
        <line x1="4" y1="16" x2="28" y2="16"/>
        <line x1="7.2" y1="9.5" x2="24.8" y2="22.5"/>
        <line x1="24.8" y1="9.5" x2="7.2" y2="22.5"/>
      </g>
      
      {/* Sparkle effects */}
      <g className="animate-pulse" style={{ animationDuration: '2.5s' }}>
        <circle cx="11" cy="11" r="0.5" fill="#ffffff" opacity="0.9"/>
        <circle cx="21" cy="13" r="0.3" fill="#ffffff" opacity="0.8"/>
        <circle cx="18" cy="21" r="0.4" fill="#ffffff" opacity="0.7"/>
      </g>
    </svg>
  );
}
