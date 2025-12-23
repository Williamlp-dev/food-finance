"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import type { BackupData } from "./types";

export async function importBackup(
  backupJson: string
): Promise<ActionResult<void>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const backup = JSON.parse(backupJson) as BackupData;

    if (!(backup.version && backup.data)) {
      return {
        success: false,
        error: "Arquivo de backup inválido",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { userId: session.user.id } });
      await tx.employee.deleteMany({ where: { userId: session.user.id } });
      await tx.purchaseItem.deleteMany({
        where: { purchase: { userId: session.user.id } },
      });
      await tx.purchase.deleteMany({ where: { userId: session.user.id } });
      await tx.stockItem.deleteMany({ where: { userId: session.user.id } });
      await tx.supplier.deleteMany({ where: { userId: session.user.id } });
      await tx.expense.deleteMany({ where: { userId: session.user.id } });
      await tx.expenseCategory.deleteMany({
        where: { userId: session.user.id },
      });
      await tx.sale.deleteMany({ where: { userId: session.user.id } });
      await tx.store.deleteMany({ where: { userId: session.user.id } });

      if (backup.data.suppliers && backup.data.suppliers.length > 0) {
        await tx.supplier.createMany({
          data: backup.data.suppliers as never,
        });
      }

      if (backup.data.stockItems && backup.data.stockItems.length > 0) {
        await tx.stockItem.createMany({
          data: backup.data.stockItems as never,
        });
      }

      if (backup.data.purchases && backup.data.purchases.length > 0) {
        for (const purchase of backup.data.purchases as {
          id: string;
          items: unknown[];
          [key: string]: unknown;
        }[]) {
          const { items, ...purchaseData } = purchase;

          const cleanItems = (items as Record<string, unknown>[]).map(
            (item) => {
              const { purchaseId, ...rest } = item;
              return rest;
            }
          );

          await tx.purchase.create({
            data: {
              ...(purchaseData as any),
              items: {
                create: cleanItems as never,
              },
            },
          });
        }
      }

      if (backup.data.employees && backup.data.employees.length > 0) {
        await tx.employee.createMany({
          data: backup.data.employees as never,
        });
      }

      if (backup.data.payments && backup.data.payments.length > 0) {
        await tx.payment.createMany({
          data: backup.data.payments as never,
        });
      }

      if (
        backup.data.expenseCategories &&
        backup.data.expenseCategories.length > 0
      ) {
        await tx.expenseCategory.createMany({
          data: backup.data.expenseCategories as never,
        });
      }

      if (backup.data.expenses && backup.data.expenses.length > 0) {
        await tx.expense.createMany({
          data: backup.data.expenses as never,
        });
      }

      if (backup.data.sales && backup.data.sales.length > 0) {
        await tx.sale.createMany({
          data: backup.data.sales as never,
        });
      }

      if (backup.data.store) {
        await tx.store.create({
          data: backup.data.store as never,
        });
      }
    });

    updateTag(`backup-summary-${session.user.id}`);
    updateTag(`suppliers-${session.user.id}`);
    updateTag(`purchases-${session.user.id}`);
    updateTag(`stock-items-${session.user.id}`);
    updateTag(`employees-${session.user.id}`);
    updateTag(`payments-${session.user.id}`);
    updateTag(`expense-categories-${session.user.id}`);
    updateTag(`expenses-${session.user.id}`);
    updateTag(`sales-${session.user.id}`);
    updateTag(`store-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error importing backup:", error);
    return {
      success: false,
      error: "Erro ao importar backup. Verifique se o arquivo é válido.",
    };
  }
}
