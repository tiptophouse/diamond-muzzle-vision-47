
interface IconProps {
  className?: string;
}

export function EmeraldIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-200`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect 
        x="6" 
        y="8" 
        width="20" 
        height="16" 
        fill="currentColor"
        opacity="0.1"
      />
      <rect 
        x="6" 
        y="8" 
        width="20" 
        height="16" 
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
