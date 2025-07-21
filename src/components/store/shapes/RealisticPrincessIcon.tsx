interface IconProps {
  className?: string;
}

export function RealisticPrincessIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Princess square shape */}
      <rect 
        x="6" y="6" 
        width="20" height="20" 
        fill="url(#princessGradient)"
        stroke="hsl(210 100% 60%)"
        strokeWidth="1"
      />
      
      {/* Princess cut step facets */}
      <g opacity="0.6">
        <rect x="8" y="8" width="16" height="16" fill="none" stroke="hsl(210 100% 50%)" strokeWidth="0.5"/>
        <rect x="10" y="10" width="12" height="12" fill="none" stroke="hsl(210 100% 45%)" strokeWidth="0.4"/>
        <rect x="12" y="12" width="8" height="8" fill="none" stroke="hsl(210 100% 40%)" strokeWidth="0.3"/>
      </g>
      
      {/* Cross facet pattern */}
      <g opacity="0.4">
        <path d="M16 6L16 26M6 16L26 16" stroke="hsl(210 100% 35%)" strokeWidth="0.3"/>
        <path d="M6 6L26 26M26 6L6 26" stroke="hsl(210 100% 35%)" strokeWidth="0.2"/>
      </g>
      
      {/* Corner brilliance */}
      <g opacity="0.5">
        <path d="M6 6L10 10L6 14L2 10Z" fill="hsl(210 100% 85%)" opacity="0.3"/>
        <path d="M26 6L30 10L26 14L22 10Z" fill="hsl(210 100% 85%)" opacity="0.3"/>
        <path d="M6 26L10 22L6 18L2 22Z" fill="hsl(210 100% 85%)" opacity="0.3"/>
        <path d="M26 26L30 22L26 18L22 22Z" fill="hsl(210 100% 85%)" opacity="0.3"/>
      </g>
      
      {/* Sparkles */}
      <circle cx="11" cy="11" r="0.8" fill="hsl(210 100% 75%)" opacity="0.8"/>
      <circle cx="21" cy="11" r="0.6" fill="hsl(210 100% 80%)" opacity="0.7"/>
      <circle cx="16" cy="20" r="0.5" fill="hsl(210 100% 85%)" opacity="0.6"/>
      
      <defs>
        <linearGradient id="princessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210 100% 95%)" />
          <stop offset="50%" stopColor="hsl(210 80% 90%)" />
          <stop offset="100%" stopColor="hsl(210 60% 85%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}