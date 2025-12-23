"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export async function deleteExpense(
  expenseId: string
): Promise<ActionResult<void>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    await prisma.expense.delete({
      where: {
        id: expenseId,
        userId: session.user.id,
      },
    });

    updateTag(`expenses-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Erro ao excluir despesa" };
  }
}
