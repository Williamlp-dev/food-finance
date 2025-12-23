"use server";

import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import type { BackupData } from "./types";

export async function exportBackup(): Promise<ActionResult<BackupData>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const [
      suppliers,
      purchases,
      stockItems,
      employees,
      payments,
      expenseCategories,
      expenses,
      sales,
      store,
    ] = await Promise.all([
      prisma.supplier.findMany({ where: { userId: session.user.id } }),
      prisma.purchase.findMany({
        where: { userId: session.user.id },
        include: { items: true },
      }),
      prisma.stockItem.findMany({ where: { userId: session.user.id } }),
      prisma.employee.findMany({ where: { userId: session.user.id } }),
      prisma.payment.findMany({ where: { userId: session.user.id } }),
      prisma.expenseCategory.findMany({ where: { userId: session.user.id } }),
      prisma.expense.findMany({ where: { userId: session.user.id } }),
      prisma.sale.findMany({ where: { userId: session.user.id } }),
      prisma.store.findUnique({ where: { userId: session.user.id } }),
    ]);

    const serializeDecimal = (obj: unknown): unknown => {
      if (obj === null || obj === undefined) {
        return obj;
      }

      if (obj instanceof Date) {
        return obj.toISOString();
      }

      if (Array.isArray(obj)) {
        return obj.map(serializeDecimal);
      }

      if (typeof obj === "object") {
        const serialized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value instanceof Date) {
            serialized[key] = value.toISOString();
          } else if (
            value !== null &&
            typeof value === "object" &&
            "toNumber" in value
          ) {
            serialized[key] = value.toString();
          } else {
            serialized[key] = serializeDecimal(value);
          }
        }
        return serialized;
      }

      return obj;
    };

    const backupData: BackupData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      userId: session.user.id,
      data: {
        suppliers: serializeDecimal(suppliers) as unknown[],
        purchases: serializeDecimal(purchases) as unknown[],
        stockItems: serializeDecimal(stockItems) as unknown[],
        employees: serializeDecimal(employees) as unknown[],
        payments: serializeDecimal(payments) as unknown[],
        expenseCategories: serializeDecimal(expenseCategories) as unknown[],
        expenses: serializeDecimal(expenses) as unknown[],
        sales: serializeDecimal(sales) as unknown[],
        store: serializeDecimal(store),
      },
    };

    return { success: true, data: backupData };
  } catch (error) {
    console.error("Error exporting backup:", error);
    return { success: false, error: "Erro ao exportar backup" };
  }
}
