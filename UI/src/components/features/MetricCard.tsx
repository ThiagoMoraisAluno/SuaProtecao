import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  colorClass?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, colorClass = "text-brand-600" }: MetricCardProps) {
  return (
    <div className="metric-card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl bg-slate-50", colorClass)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}>
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-slate-900 font-display">{value}</p>
        <p className="text-sm font-medium text-slate-500 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
