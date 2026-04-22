import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  className: string;
}

export function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <span className={cn("status-badge", className)}>
      {label}
    </span>
  );
}
