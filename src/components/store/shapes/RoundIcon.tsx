
interface IconProps {
  className?: string;
}

export function RoundIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle 
        cx="16" 
        cy="16" 
        r="13" 
        fill="hsl(210 40% 96%)"
        stroke="hsl(214 31% 91%)"
        strokeWidth="1"
      />
      <circle 
        cx="16" 
        cy="16" 
        r="9" 
        fill="none" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      <circle 
        cx="16" 
        cy="16" 
        r="5" 
        fill="none" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.3" 
        opacity="0.4"
      />
    </svg>
  );
}
