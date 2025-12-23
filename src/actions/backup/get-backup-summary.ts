"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import type { BackupSummary } from "./types";

async function fetchBackupSummary(userId: string) {
  "use cache";
  cacheTag(`backup-summary-${userId}`);

  const [
    suppliers,
    purchases,
    stockItems,
    employees,
    payments,
    expenses,
    sales,
  ] = await Promise.all([
    prisma.supplier.count({ where: { userId } }),
    prisma.purchase.count({ where: { userId } }),
    prisma.stockItem.count({ where: { userId } }),
    prisma.employee.count({ where: { userId } }),
    prisma.payment.count({ where: { userId } }),
    prisma.expense.count({ where: { userId } }),
    prisma.sale.count({ where: { userId } }),
  ]);

  return {
    suppliers,
    purchases,
    stockItems,
    employees,
    payments,
    expenses,
    sales,
  };
}

export async function getBackupSummary(): Promise<ActionResult<BackupSummary>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const summary = await fetchBackupSummary(session.user.id);
    return { success: true, data: summary };
  } catch (error) {
    console.error("Error getting backup summary:", error);
    return { success: false, error: "Erro ao buscar resumo dos dados" };
  }
}
