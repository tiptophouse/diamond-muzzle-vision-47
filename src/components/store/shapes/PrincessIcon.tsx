
interface IconProps {
  className?: string;
}

export function PrincessIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 hover:rotate-3`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="princessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="princessShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path 
        d="M8 8h16v16H8z" 
        fill="url(#princessGradient)"
        filter="url(#princessShadow)"
      />
      <path d="M8 8L16 4L24 8" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
      <path d="M8 24L16 28L24 24" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
      <path d="M12 12h8v8h-8z" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.5"/>
      <path d="M14 14h4v4h-4z" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.3"/>
    </svg>
  );
}
