
interface IconProps {
  className?: string;
}

export function HeartIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110 hover:text-pink-500`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="heartShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path 
        d="M23.1 7.3a6.29 6.29 0 0 0-8.9 0l-1.2 1.2-1.2-1.2a6.3 6.3 0 0 0-8.9 8.9L16 29.4l13.1-13.2a6.3 6.3 0 0 0 0-8.9z" 
        fill="url(#heartGradient)"
        filter="url(#heartShadow)"
        className="animate-pulse"
        style={{ animationDuration: '2s' }}
      />
      <path d="M16 8.5v20.9" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
    </svg>
  );
}
