import { AlertTriangle } from "lucide-react";
import type { LowStockItem } from "@/actions/dashboard/types";
import { cn } from "@/lib/utils";

type LowStockAlertProps = {
  items: LowStockItem[];
};

export function LowStockAlert({
  items,
}: LowStockAlertProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Estoque Baixo</h3>
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Nenhum item com estoque baixo
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="size-5 text-yellow-500" />
        <h3 className="font-semibold text-lg">Estoque Baixo</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const isVeryLow = item.quantity === 0;
          return (
            <div
              className={cn(
                "flex items-center justify-between rounded-lg p-3",
                isVeryLow
                  ? "border border-red-500/20 bg-red-500/10"
                  : "border border-yellow-500/20 bg-yellow-500/10"
              )}
              key={item.id}
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-muted-foreground text-xs">
                  Mínimo: 1 {item.unit}
                </p>
              </div>
              <span
                className={cn(
                  "font-semibold",
                  isVeryLow ? "text-red-500" : "text-yellow-600"
                )}
              >
                {item.quantity} {item.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
