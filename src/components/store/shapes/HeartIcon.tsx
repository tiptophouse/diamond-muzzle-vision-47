
interface IconProps {
  className?: string;
}

export function HeartIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg 
      className={`${className} transition-all duration-200`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M16 26l-1.5-1.35C9.4 19.8 5 15.78 5 10.5 5 7.42 7.42 5 10.5 5c1.74 0 3.41.81 4.5 2.09C16.09 5.81 17.76 5 19.5 5 22.58 5 25 7.42 25 10.5c0 5.28-4.4 9.3-9.5 14.15L16 26z"
        fill="currentColor"
        opacity="0.1"
      />
      <path 
        d="M16 26l-1.5-1.35C9.4 19.8 5 15.78 5 10.5 5 7.42 7.42 5 10.5 5c1.74 0 3.41.81 4.5 2.09C16.09 5.81 17.76 5 19.5 5 22.58 5 25 7.42 25 10.5c0 5.28-4.4 9.3-9.5 14.15L16 26z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
