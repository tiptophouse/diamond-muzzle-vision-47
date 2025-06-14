
interface IconProps {
  className?: string;
}

export function PearIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8 2 5 6 5 10c0 6 7 12 7 12s7-6 7-12c0-4-3-8-7-8z" />
      <path d="M12 2v20" />
      <path d="M8 8c2-2 4-2 6 0" />
      <path d="M7 12c3-1 5-1 8 0" />
    </svg>
  );
}
