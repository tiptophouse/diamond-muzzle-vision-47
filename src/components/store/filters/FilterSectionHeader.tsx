import { Badge } from "@/components/ui/badge";

interface FilterSectionHeaderProps {
  label: string;
  count?: number;
}

export function FilterSectionHeader({ label, count }: FilterSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      )}
    </div>
  );
}