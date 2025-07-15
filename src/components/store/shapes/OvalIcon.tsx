
interface IconProps {
  className?: string;
}

export function OvalIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse 
        cx="16" 
        cy="16" 
        rx="13" 
        ry="10" 
        fill="hsl(210 40% 96%)"
        stroke="hsl(214 31% 91%)"
        strokeWidth="1"
      />
      <ellipse 
        cx="16" 
        cy="16" 
        rx="9" 
        ry="7" 
        fill="none" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      <ellipse 
        cx="16" 
        cy="16" 
        rx="5" 
        ry="4" 
        fill="none" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.3" 
        opacity="0.4"
      />
    </svg>
  );
}
