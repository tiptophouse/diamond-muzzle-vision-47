
interface IconProps {
  className?: string;
}

export function OvalIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="12" rx="8" ry="6" />
      <path d="M4 12h16" />
      <path d="M12 6v12" />
      <path d="M6.5 8.5l11 7" />
      <path d="M6.5 15.5l11-7" />
    </svg>
  );
}
