
interface IconProps {
  className?: string;
}

export function AsscherIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect 
        x="7" 
        y="7" 
        width="18" 
        height="18" 
        fill="hsl(210 40% 96%)"
        stroke="hsl(214 31% 91%)"
        strokeWidth="1"
      />
      <path 
        d="M7 12h18M7 20h18M12 7v18M20 7v18" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      <path 
        d="M7 7l5 5M25 7l-5 5M7 25l5-5M25 25l-5-5" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.3" 
        opacity="0.4"
      />
    </svg>
  );
}
