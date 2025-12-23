"use server";

import { subDays } from "date-fns";
import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import type { ChartDataPoint } from "./types";

async function fetchChartData(userId: string) {
  "use cache";
  cacheTag(`chart-data-${userId}`);

  const today = new Date();
  const sevenDaysAgo = subDays(today, 6);

  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        date: true,
        totalValue: true,
      },
    }),
    prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        date: true,
        value: true,
      },
    }),
  ]);

  const chartData: Record<string, { sales: number; expenses: number }> = {};

  for (let i = 0; i < 7; i++) {
    const date = subDays(today, 6 - i);
    const dateKey = date.toISOString().split("T")[0];
    chartData[dateKey] = { sales: 0, expenses: 0 };
  }

  for (const sale of sales) {
    const dateKey = new Date(sale.date).toISOString().split("T")[0];
    if (chartData[dateKey]) {
      chartData[dateKey].sales += Number(sale.totalValue);
    }
  }

  for (const expense of expenses) {
    const dateKey = new Date(expense.date).toISOString().split("T")[0];
    if (chartData[dateKey]) {
      chartData[dateKey].expenses += Number(expense.value);
    }
  }

  return Object.entries(chartData).map(([date, values]) => ({
    date,
    sales: values.sales,
    expenses: values.expenses,
  }));
}

export async function getChartData(): Promise<ActionResult<ChartDataPoint[]>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const data = await fetchChartData(session.user.id);
    return { success: true, data };
  } catch (error) {
    console.error("Error getting chart data:", error);
    return { success: false, error: "Erro ao buscar dados do gráfico" };
  }
}
