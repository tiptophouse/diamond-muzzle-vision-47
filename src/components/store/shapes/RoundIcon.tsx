
interface IconProps {
  className?: string;
}

export function RoundIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 drop-shadow-lg`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="roundDiamondGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
          <stop offset="30%" stopColor="#e0f2fe" stopOpacity="0.8"/>
          <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9"/>
        </radialGradient>
        <filter id="roundDiamondShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0ea5e9" floodOpacity="0.4"/>
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#0ea5e9" floodOpacity="0.2"/>
        </filter>
        <filter id="sparkle">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Main diamond body */}
      <circle 
        cx="16" 
        cy="16" 
        r="12" 
        fill="url(#roundDiamondGradient)"
        filter="url(#roundDiamondShadow)"
        className="animate-pulse"
        style={{ animationDuration: '3s' }}
      />
      
      {/* Facet lines */}
      <g stroke="#ffffff" strokeWidth="0.5" opacity="0.7" filter="url(#sparkle)">
        <circle cx="16" cy="16" r="10" fill="none"/>
        <circle cx="16" cy="16" r="7" fill="none"/>
        <circle cx="16" cy="16" r="4" fill="none"/>
        <line x1="16" y1="4" x2="16" y2="28"/>
        <line x1="4" y1="16" x2="28" y2="16"/>
        <line x1="7.8" y1="7.8" x2="24.2" y2="24.2"/>
        <line x1="24.2" y1="7.8" x2="7.8" y2="24.2"/>
      </g>
      
      {/* Sparkle effects */}
      <g className="animate-pulse" style={{ animationDuration: '2s' }}>
        <circle cx="12" cy="10" r="0.5" fill="#ffffff" opacity="0.9"/>
        <circle cx="20" cy="12" r="0.3" fill="#ffffff" opacity="0.8"/>
        <circle cx="18" cy="22" r="0.4" fill="#ffffff" opacity="0.7"/>
      </g>
    </svg>
  );
}
