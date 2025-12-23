"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import type { DashboardMetrics } from "./types";

async function fetchDashboardMetrics(userId: string) {
  "use cache";
  cacheTag(`dashboard-metrics-${userId}`);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const [sales, purchases, expenses] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        totalValue: true,
      },
    }),
    prisma.purchase.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        total: true,
      },
    }),
    prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        value: true,
      },
    }),
  ]);

  const salesMonth = Number(sales._sum.totalValue || 0);
  const purchasesMonth = Number(purchases._sum.total || 0);
  const expensesMonth = Number(expenses._sum.value || 0);
  const estimatedProfit = salesMonth - (purchasesMonth + expensesMonth);

  return {
    salesMonth,
    purchasesMonth,
    expensesMonth,
    estimatedProfit,
  };
}

export async function getDashboardMetrics(): Promise<
  ActionResult<DashboardMetrics>
> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const metrics = await fetchDashboardMetrics(session.user.id);
    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return { success: false, error: "Erro ao buscar métricas" };
  }
}
