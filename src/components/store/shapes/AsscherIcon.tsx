
interface IconProps {
  className?: string;
}

export function AsscherIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 hover:rotate-45`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="asscherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="asscherShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      <rect 
        x="8" 
        y="8" 
        width="16" 
        height="16" 
        fill="url(#asscherGradient)"
        filter="url(#asscherShadow)"
        transform="rotate(0 16 16)"
      />
      <path d="M8 12h16M8 20h16M12 8v16M20 8v16" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
      <path d="M8 8l4 4M24 8l-4 4M8 24l4-4M24 24l-4-4" stroke="currentColor" strokeWidth="0.3" opacity="0.4"/>
    </svg>
  );
}
