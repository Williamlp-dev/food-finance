"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

type MonthlySummary = {
  sales: string;
  purchases: string;
  expenses: string;
  balance: string;
  profit: string;
};

async function fetchMonthlySummary(
  userId: string,
  year: number,
  month: number
) {
  "use cache";
  cacheTag(`monthly-summary-${userId}-${year}-${month}`);

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const [sales, purchases, expenses] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { totalValue: true },
    }),
    prisma.purchase.aggregate({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { total: true },
    }),
    prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { value: true },
    }),
  ]);

  const salesTotal = sales._sum.totalValue?.toNumber() || 0;
  const purchasesTotal = purchases._sum.total?.toNumber() || 0;
  const expensesTotal = expenses._sum.value?.toNumber() || 0;

  const balance = salesTotal - (purchasesTotal + expensesTotal);
  const profit = salesTotal - purchasesTotal - expensesTotal;

  return {
    sales: salesTotal.toFixed(2),
    purchases: purchasesTotal.toFixed(2),
    expenses: expensesTotal.toFixed(2),
    balance: balance.toFixed(2),
    profit: profit.toFixed(2),
  };
}

export async function getMonthlySummary(
  year: number,
  month: number
): Promise<ActionResult<MonthlySummary>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const summary = await fetchMonthlySummary(session.user.id, year, month);
    return { success: true, data: summary };
  } catch (error) {
    console.error("Error getting monthly summary:", error);
    return { success: false, error: "Erro ao buscar resumo mensal" };
  }
}
