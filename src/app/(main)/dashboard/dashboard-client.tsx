"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import type {
  ChartDataPoint,
  DashboardMetrics,
  LowStockItem,
} from "@/actions/dashboard/types";
import { LowStockAlert } from "./low-stock-alert";
import { MetricCard } from "./metric-card";
import { SalesChart } from "./sales-chart";

type DashboardClientProps = {
  metrics: DashboardMetrics;
  chartData: ChartDataPoint[];
  lowStockItems: LowStockItem[];
  suppliersCount: number;
  employeesCount: number;
  stockItemsCount: number;
};

export function DashboardClient({
  metrics,
  chartData,
  lowStockItems,
  suppliersCount,
  employeesCount,
  stockItemsCount,
}: DashboardClientProps): React.ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Visão geral da sua finanças
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<ArrowUpCircle className="size-5" />}
          title="Vendas do Mês"
          value={metrics.salesMonth}
          variant="success"
        />
        <MetricCard
          icon={<ArrowDownCircle className="size-5" />}
          title="Compras do Mês"
          value={metrics.purchasesMonth}
          variant="warning"
        />
        <MetricCard
          icon={<DollarSign className="size-5" />}
          title="Despesas do Mês"
          value={metrics.expensesMonth}
          variant="danger"
        />
        <MetricCard
          icon={<TrendingUp className="size-5" />}
          title="Lucro Estimado"
          value={metrics.estimatedProfit}
          variant={metrics.estimatedProfit >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SalesChart data={chartData} />
        <LowStockAlert items={lowStockItems} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Fornecedores</p>
          <p className="mt-2 font-bold text-2xl">{suppliersCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Funcionários</p>
          <p className="mt-2 font-bold text-2xl">{employeesCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Itens no Estoque</p>
          <p className="mt-2 font-bold text-2xl">{stockItemsCount}</p>
        </div>
      </div>
    </div>
  );
}
