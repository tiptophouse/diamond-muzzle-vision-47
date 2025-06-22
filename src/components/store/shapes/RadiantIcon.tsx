
interface IconProps {
  className?: string;
}

export function RadiantIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 4h8l3 3v10l-3 3H8l-3-3V7z" />
      <path d="M5 7h14" />
      <path d="M5 17h14" />
      <path d="M8 4v16" />
      <path d="M16 4v16" />
      <path d="M5 7l3-3" />
      <path d="M19 7l-3-3" />
      <path d="M5 17l3 3" />
      <path d="M19 17l-3 3" />
    </svg>
  );
}
