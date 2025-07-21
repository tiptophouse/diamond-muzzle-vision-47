interface IconProps {
  className?: string;
}

export function RealisticEmeraldIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Emerald cut octagon shape */}
      <path 
        d="M8 6h16l4 4v12l-4 4H8l-4-4V10z" 
        fill="url(#emeraldGradient)"
        stroke="hsl(210 100% 60%)"
        strokeWidth="1"
      />
      
      {/* Step cut facets */}
      <g opacity="0.6">
        <path d="M10 8h12l3 3v10l-3 3H10l-3-3V11z" fill="none" stroke="hsl(210 100% 50%)" strokeWidth="0.5"/>
        <path d="M12 10h8l2 2v8l-2 2h-8l-2-2v-8z" fill="none" stroke="hsl(210 100% 45%)" strokeWidth="0.4"/>
        <path d="M14 12h4l1 1v6l-1 1h-4l-1-1v-6z" fill="none" stroke="hsl(210 100% 40%)" strokeWidth="0.3"/>
      </g>
      
      {/* Parallel step lines */}
      <g opacity="0.4">
        <path d="M8 12h16M8 16h16M8 20h16" stroke="hsl(210 100% 35%)" strokeWidth="0.3"/>
        <path d="M12 6v20M16 6v20M20 6v20" stroke="hsl(210 100% 35%)" strokeWidth="0.2"/>
      </g>
      
      {/* Corner cuts characteristic of emerald */}
      <g opacity="0.5">
        <path d="M4 10L8 6L8 10Z" fill="hsl(210 100% 85%)" opacity="0.4"/>
        <path d="M28 10L24 6L24 10Z" fill="hsl(210 100% 85%)" opacity="0.4"/>
        <path d="M4 22L8 26L8 22Z" fill="hsl(210 100% 85%)" opacity="0.4"/>
        <path d="M28 22L24 26L24 22Z" fill="hsl(210 100% 85%)" opacity="0.4"/>
      </g>
      
      {/* Hall of mirrors effect */}
      <rect x="13" y="13" width="6" height="6" fill="hsl(210 100% 92%)" opacity="0.3"/>
      
      {/* Sparkles */}
      <circle cx="12" cy="10" r="0.7" fill="hsl(210 100% 75%)" opacity="0.8"/>
      <circle cx="20" cy="14" r="0.6" fill="hsl(210 100% 80%)" opacity="0.7"/>
      <circle cx="16" cy="22" r="0.5" fill="hsl(210 100% 85%)" opacity="0.6"/>
      
      <defs>
        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210 100% 95%)" />
          <stop offset="50%" stopColor="hsl(210 80% 90%)" />
          <stop offset="100%" stopColor="hsl(210 60% 85%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}