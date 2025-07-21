interface IconProps {
  className?: string;
}

export function RealisticRoundIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main diamond circle */}
      <circle 
        cx="16" 
        cy="16" 
        r="12" 
        fill="url(#roundGradient)"
        stroke="hsl(210 100% 60%)"
        strokeWidth="1"
      />
      
      {/* Brilliant cut facets - outer */}
      <g opacity="0.6">
        <path d="M16 4L20 8L16 12L12 8Z" fill="none" stroke="hsl(210 100% 50%)" strokeWidth="0.5"/>
        <path d="M28 16L24 12L28 8L28 20Z" fill="none" stroke="hsl(210 100% 50%)" strokeWidth="0.5"/>
        <path d="M16 28L12 24L16 20L20 24Z" fill="none" stroke="hsl(210 100% 50%)" strokeWidth="0.5"/>
        <path d="M4 16L8 20L4 24L4 8Z" fill="none" stroke="hsl(210 100% 50%)" strokeWidth="0.5"/>
      </g>
      
      {/* Inner facets for brilliance */}
      <g opacity="0.4">
        <circle cx="16" cy="16" r="8" fill="none" stroke="hsl(210 100% 40%)" strokeWidth="0.3"/>
        <circle cx="16" cy="16" r="4" fill="none" stroke="hsl(210 100% 30%)" strokeWidth="0.2"/>
      </g>
      
      {/* Sparkle effects */}
      <circle cx="12" cy="10" r="0.8" fill="hsl(210 100% 70%)" opacity="0.8"/>
      <circle cx="21" cy="13" r="0.6" fill="hsl(210 100% 80%)" opacity="0.6"/>
      <circle cx="18" cy="22" r="0.5" fill="hsl(210 100% 75%)" opacity="0.7"/>
      
      <defs>
        <radialGradient id="roundGradient" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="hsl(210 100% 95%)" />
          <stop offset="50%" stopColor="hsl(210 80% 90%)" />
          <stop offset="100%" stopColor="hsl(210 60% 85%)" />
        </radialGradient>
      </defs>
    </svg>
  );
}