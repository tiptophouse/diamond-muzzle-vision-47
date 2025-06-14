
interface IconProps {
  className?: string;
}

export function AsscherIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" />
      <path d="M6 9h12" />
      <path d="M6 15h12" />
      <path d="M9 6v12" />
      <path d="M15 6v12" />
      <path d="M6 6l3 3" />
      <path d="M18 6l-3 3" />
      <path d="M6 18l3-3" />
      <path d="M18 18l-3-3" />
    </svg>
  );
}
