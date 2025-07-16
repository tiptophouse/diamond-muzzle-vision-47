
interface IconProps {
  className?: string;
}

export function RadiantIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-200`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M10 6h12l4 4v12l-4 4H10l-4-4V10z" 
        fill="currentColor"
        opacity="0.1"
      />
      <path 
        d="M10 6h12l4 4v12l-4 4H10l-4-4V10z" 
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
