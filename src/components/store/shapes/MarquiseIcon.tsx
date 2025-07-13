
interface IconProps {
  className?: string;
}

export function MarquiseIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="marquiseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="marquiseShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2"/>
        </filter>
      </defs>
      <path 
        d="M4 16C4 8 8 4 16 4C24 4 28 8 28 16C28 24 24 28 16 28C8 28 4 24 4 16Z" 
        fill="url(#marquiseGradient)"
        filter="url(#marquiseShadow)"
        transform="scale(0.6 1) translate(10.5 0)"
      />
      <path d="M16 8v16" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
      <path d="M8 12l16 8" stroke="currentColor" strokeWidth="0.3" opacity="0.5"/>
      <path d="M8 20l16-8" stroke="currentColor" strokeWidth="0.3" opacity="0.5"/>
    </svg>
  );
}
