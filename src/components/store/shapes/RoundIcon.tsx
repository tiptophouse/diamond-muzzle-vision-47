
interface IconProps {
  className?: string;
}

export function RoundIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 text-slate-700`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="roundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="roundShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* Outer glow circle */}
      <circle 
        cx="16" 
        cy="16" 
        r="14" 
        fill="none"
        stroke="url(#roundGradient)"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Main diamond circle */}
      <circle 
        cx="16" 
        cy="16" 
        r="11" 
        fill="url(#roundGradient)"
        filter="url(#roundShadow)"
      />
      {/* Inner reflection circles */}
      <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="0.8" opacity="0.8"/>
      <circle cx="16" cy="16" r="5" fill="none" stroke="white" strokeWidth="0.6" opacity="0.6"/>
      <circle cx="16" cy="16" r="2" fill="white" opacity="0.9"/>
      {/* Sparkle effects */}
      <circle cx="12" cy="10" r="1" fill="white" opacity="0.9"/>
      <circle cx="20" cy="12" r="0.8" fill="white" opacity="0.8"/>
      <circle cx="14" cy="22" r="0.6" fill="white" opacity="0.7"/>
    </svg>
  );
}
