
interface IconProps {
  className?: string;
}

export function EmeraldIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 hover:-rotate-2`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="emeraldShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path 
        d="M9 7h14l3 4v10l-3 4H9l-3-4V11z" 
        fill="url(#emeraldGradient)"
        filter="url(#emeraldShadow)"
      />
      <path d="M6 11h20" stroke="currentColor" strokeWidth="0.4" opacity="0.7"/>
      <path d="M6 21h20" stroke="currentColor" strokeWidth="0.4" opacity="0.7"/>
      <path d="M12 11h8v10h-8z" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.5"/>
    </svg>
  );
}
