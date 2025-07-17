
interface IconProps {
  className?: string;
}

export function PrincessIcon({ className = "h-6 w-6" }: IconProps) {
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
        d="M7 7L16 3L25 7M7 25L16 29L25 25" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      <rect 
        x="11" 
        y="11" 
        width="10" 
        height="10" 
        fill="none" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.3" 
        opacity="0.4"
      />
    </svg>
  );
}
