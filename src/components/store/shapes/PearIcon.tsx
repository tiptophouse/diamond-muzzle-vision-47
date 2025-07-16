
interface IconProps {
  className?: string;
}

export function PearIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-200`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M16 5 C20 5, 24 9, 24 14 C24 20, 20 25, 16 27 C12 25, 8 20, 8 14 C8 9, 12 5, 16 5 Z"
        fill="currentColor"
        opacity="0.1"
      />
      <path 
        d="M16 5 C20 5, 24 9, 24 14 C24 20, 20 25, 16 27 C12 25, 8 20, 8 14 C8 9, 12 5, 16 5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
