"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export async function deleteExpenseCategory(
  categoryId: string
): Promise<ActionResult<void>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const expensesCount = await prisma.expense.count({
      where: { categoryId },
    });

    if (expensesCount > 0) {
      return {
        success: false,
        error: `Não é possível excluir esta categoria pois existem ${expensesCount} despesa(s) associada(s)`,
      };
    }

    await prisma.expenseCategory.delete({
      where: {
        id: categoryId,
        userId: session.user.id,
      },
    });

    updateTag(`expense-categories-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting expense category:", error);
    return { success: false, error: "Erro ao excluir categoria de despesa" };
  }
}
