
interface IconProps {
  className?: string;
}

export function CushionIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect 
        x="6" 
        y="6" 
        width="20" 
        height="20" 
        rx="5" 
        fill="hsl(210 40% 96%)"
        stroke="hsl(214 31% 91%)"
        strokeWidth="1"
      />
      <rect 
        x="9" 
        y="9" 
        width="14" 
        height="14" 
        rx="3" 
        fill="none" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      <rect 
        x="12" 
        y="12" 
        width="8" 
        height="8" 
        rx="2" 
        fill="none" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.3" 
        opacity="0.4"
      />
    </svg>
  );
}
