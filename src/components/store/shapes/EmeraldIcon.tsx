
interface IconProps {
  className?: string;
}

export function EmeraldIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 4h10l2 3v10l-2 3H7l-2-3V7z" />
      <path d="M5 7h14" />
      <path d="M5 17h14" />
      <path d="M7 4v16" />
      <path d="M17 4v16" />
    </svg>
  );
}
