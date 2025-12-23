import { cn, formatPrice } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info";
};

const variantStyles = {
  success: {
    card: "bg-green-500/5 border-green-500/20",
    icon: "text-green-500",
  },
  warning: {
    card: "bg-orange-500/5 border-orange-500/20",
    icon: "text-orange-500",
  },
  danger: {
    card: "bg-red-500/5 border-red-500/20",
    icon: "text-red-500",
  },
  info: {
    card: "bg-blue-500/5 border-blue-500/20",
    icon: "text-blue-500",
  },
};

export function MetricCard({
  title,
  value,
  icon,
  variant = "info",
}: MetricCardProps): React.ReactElement {
  return (
    <div className={cn("rounded-lg border p-4", variantStyles[variant].card)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{title}</p>
          <p className="mt-2 truncate font-bold text-xl sm:text-2xl">
            {formatPrice(value)}
          </p>
        </div>
        <div className={cn("shrink-0", variantStyles[variant].icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
