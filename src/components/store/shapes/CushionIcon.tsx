
interface IconProps {
  className?: string;
}

export function CushionIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 4h10c1.5 0 3 1.5 3 3v10c0 1.5-1.5 3-3 3H7c-1.5 0-3-1.5-3-3V7c0-1.5 1.5-3 3-3z" />
      <path d="M4 7h16" />
      <path d="M4 17h16" />
      <path d="M7 4v16" />
      <path d="M17 4v16" />
    </svg>
  );
}
