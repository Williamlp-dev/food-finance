"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type ExpenseFormData, expenseSchema } from "./types";

export async function createExpense(
  data: ExpenseFormData
): Promise<ActionResult<{ expenseId: string }>> {
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

  try {
    const expense = await prisma.expense.create({
      data: {
        categoryId: parsed.data.categoryId,
        description: parsed.data.description || null,
        value: parsed.data.value,
        date: parsed.data.date,
        paymentMethod: parsed.data.paymentMethod,
        userId: session.user.id,
      },
    });

    updateTag(`expenses-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: { expenseId: expense.id } };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Erro ao criar despesa" };
  }
}
