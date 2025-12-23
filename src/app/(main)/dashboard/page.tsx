import type { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { getChartData } from "@/actions/dashboard/get-chart-data";
import { getDashboardMetrics } from "@/actions/dashboard/get-dashboard-metrics";
import { getLowStockItems } from "@/actions/dashboard/get-low-stock-items";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage(): Promise<React.ReactElement> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const [metricsResult, chartDataResult, lowStockResult, counts] =
    await Promise.all([
      getDashboardMetrics(),
      getChartData(),
      getLowStockItems(),
      Promise.all([
        prisma.supplier.count({ where: { userId: session.user.id } }),
        prisma.employee.count({ where: { userId: session.user.id } }),
        prisma.stockItem.count({ where: { userId: session.user.id } }),
      ]),
    ]);

  const metrics = metricsResult.success
    ? metricsResult.data
    : {
        salesMonth: 0,
        purchasesMonth: 0,
        expensesMonth: 0,
        estimatedProfit: 0,
      };

  const chartData = chartDataResult.success ? chartDataResult.data : [];
  const lowStockItems = lowStockResult.success ? lowStockResult.data : [];
  const [suppliersCount, employeesCount, stockItemsCount] = counts;

  return (
    <DashboardClient
      chartData={chartData}
      employeesCount={employeesCount}
      lowStockItems={lowStockItems}
      metrics={metrics}
      stockItemsCount={stockItemsCount}
      suppliersCount={suppliersCount}
    />
  );
}
