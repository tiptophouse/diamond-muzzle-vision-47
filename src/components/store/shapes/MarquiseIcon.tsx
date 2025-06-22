
interface IconProps {
  className?: string;
}

export function MarquiseIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9z" transform="scale(1.5,0.7) translate(-6,5.5)" />
      <path d="M12 5v14" />
      <path d="M6 9l12 6" />
      <path d="M6 15l12-6" />
    </svg>
  );
}
