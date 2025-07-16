
interface IconProps {
  className?: string;
}

export function OvalIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ovalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="ovalShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2"/>
        </filter>
      </defs>
      <ellipse 
        cx="16" 
        cy="16" 
        rx="12" 
        ry="9" 
        fill="url(#ovalGradient)"
        filter="url(#ovalShadow)"
        className="animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <ellipse cx="16" cy="16" rx="8" ry="6" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
      <ellipse cx="16" cy="16" rx="4" ry="3" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.4"/>
    </svg>
  );
}
