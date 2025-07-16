
interface IconProps {
  className?: string;
}

export function PrincessIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 hover:rotate-3 drop-shadow-lg`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="princessDiamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
          <stop offset="30%" stopColor="#e0e7ff" stopOpacity="0.8"/>
          <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="princessDiamondShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#8b5cf6" floodOpacity="0.4"/>
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      {/* Main diamond body */}
      <rect 
        x="6" 
        y="6" 
        width="20" 
        height="20" 
        fill="url(#princessDiamondGradient)"
        filter="url(#princessDiamondShadow)"
        className="animate-pulse"
        style={{ animationDuration: '3s' }}
      />
      
      {/* Facet lines creating square brilliant cut pattern */}
      <g stroke="#ffffff" strokeWidth="0.4" opacity="0.7">
        <rect x="8" y="8" width="16" height="16" fill="none"/>
        <rect x="10" y="10" width="12" height="12" fill="none"/>
        <rect x="12" y="12" width="8" height="8" fill="none"/>
        <rect x="14" y="14" width="4" height="4" fill="none"/>
        
        {/* Corner to corner lines */}
        <line x1="6" y1="6" x2="26" y2="26"/>
        <line x1="26" y1="6" x2="6" y2="26"/>
        <line x1="16" y1="6" x2="16" y2="26"/>
        <line x1="6" y1="16" x2="26" y2="16"/>
        
        {/* Additional facet lines */}
        <line x1="6" y1="10" x2="10" y2="6"/>
        <line x1="26" y1="10" x2="22" y2="6"/>
        <line x1="6" y1="22" x2="10" y2="26"/>
        <line x1="26" y1="22" x2="22" y2="26"/>
      </g>
      
      {/* Sparkle effects */}
      <g className="animate-pulse" style={{ animationDuration: '2s' }}>
        <circle cx="12" cy="12" r="0.5" fill="#ffffff" opacity="0.9"/>
        <circle cx="20" cy="12" r="0.3" fill="#ffffff" opacity="0.8"/>
        <circle cx="16" cy="20" r="0.4" fill="#ffffff" opacity="0.7"/>
        <circle cx="20" cy="20" r="0.3" fill="#ffffff" opacity="0.6"/>
      </g>
    </svg>
  );
}
