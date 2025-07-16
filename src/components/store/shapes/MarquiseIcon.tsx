
interface IconProps {
  className?: string;
}

export function MarquiseIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-200`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse 
        cx="16" 
        cy="16" 
        rx="12" 
        ry="6" 
        fill="currentColor"
        opacity="0.1"
      />
      <ellipse 
        cx="16" 
        cy="16" 
        rx="12" 
        ry="6" 
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
