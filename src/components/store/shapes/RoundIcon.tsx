
interface IconProps {
  className?: string;
}

export function RoundIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="roundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="roundShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2"/>
        </filter>
      </defs>
      <circle 
        cx="16" 
        cy="16" 
        r="12" 
        fill="url(#roundGradient)"
        filter="url(#roundShadow)"
        className="animate-pulse"
        style={{ animationDuration: '3s' }}
      />
      <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
      <circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.4"/>
    </svg>
  );
}
