
interface IconProps {
  className?: string;
}

export function PearIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 hover:-rotate-12`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="pearShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path 
        d="M16 4C12 4 9 8 9 12C9 18 16 28 16 28S23 18 23 12C23 8 20 4 16 4Z" 
        fill="url(#pearGradient)"
        filter="url(#pearShadow)"
      />
      <path d="M16 4v24" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
      <path d="M12 10c2-2 4-2 6 0" stroke="currentColor" strokeWidth="0.3" opacity="0.5"/>
      <path d="M11 16c3-1 5-1 8 0" stroke="currentColor" strokeWidth="0.3" opacity="0.4"/>
    </svg>
  );
}
