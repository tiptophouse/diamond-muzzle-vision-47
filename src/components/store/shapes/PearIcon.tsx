
interface IconProps {
  className?: string;
}

export function PearIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M16 5C12.5 5 10 8 10 12C10 17 16 26 16 26S22 17 22 12C22 8 19.5 5 16 5Z" 
        fill="hsl(210 40% 96%)"
        stroke="hsl(214 31% 91%)"
        strokeWidth="1"
      />
      <path 
        d="M16 5v21" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      <path 
        d="M12 10c2-1 4-1 6 0M11 15c3-1 5-1 8 0" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.3" 
        opacity="0.4"
      />
    </svg>
  );
}
