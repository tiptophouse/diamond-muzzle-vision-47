
interface IconProps {
  className?: string;
}

export function PrincessIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" />
      <path d="M6 6L12 2L18 6" />
      <path d="M6 18L12 22L18 18" />
      <path d="M12 2v20" />
      <path d="M6 6h12" />
      <path d="M6 18h12" />
    </svg>
  );
}
