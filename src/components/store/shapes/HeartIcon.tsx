
interface IconProps {
  className?: string;
}

export function HeartIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-300 hover:scale-110`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M23.1 8.3a5.29 5.29 0 0 0-7.9 0l-1.2 1.2-1.2-1.2a5.3 5.3 0 0 0-7.9 7.9L16 27.4l11.1-11.2a5.3 5.3 0 0 0 0-7.9z" 
        fill="hsl(210 40% 96%)"
        stroke="hsl(214 31% 91%)"
        strokeWidth="1"
      />
      <path 
        d="M16 9.5v17.9" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      <path 
        d="M12 12c2-1 4-1 6 0" 
        stroke="hsl(200 100% 42%)" 
        strokeWidth="0.3" 
        opacity="0.4"
      />
    </svg>
  );
}
