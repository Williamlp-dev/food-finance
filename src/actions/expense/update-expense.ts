"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type ExpenseFormData, expenseSchema } from "./types";

export async function updateExpense(
  id: string,
  data: ExpenseFormData
): Promise<ActionResult<void>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existingExpense) {
    return { success: false, error: "Despesa não encontrada" };
  }

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        categoryId: parsed.data.categoryId,
        description: parsed.data.description || null,
        value: parsed.data.value,
        date: parsed.data.date,
        paymentMethod: parsed.data.paymentMethod,
      },
    });

    updateTag(`expenses-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { success: false, error: "Erro ao atualizar despesa" };
  }
}
