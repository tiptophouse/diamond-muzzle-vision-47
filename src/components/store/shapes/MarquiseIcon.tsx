
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
      <ellipse 
        cx="16" 
        cy="16" 
        rx="5" 
        ry="13" 
        fill="hsl(210 40% 96%)"
        stroke="hsl(214 31% 91%)"
        strokeWidth="1"
      />
      <ellipse 
        cx="16" 
        cy="16" 
        rx="3" 
        ry="9" 
        fill="none" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      <path 
        d="M16 4v24M12 8l8 16M20 8l-8 16" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.3" 
        opacity="0.4"
      />
    </svg>
  );
}
