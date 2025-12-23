"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type ExpenseCategoryFormData, expenseCategorySchema } from "./types";

export async function createExpenseCategory(
  data: ExpenseCategoryFormData
): Promise<ActionResult<{ categoryId: string }>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = expenseCategorySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const category = await prisma.expenseCategory.create({
      data: {
        name: parsed.data.name,
        userId: session.user.id,
      },
    });

    updateTag(`expense-categories-${session.user.id}`);

    return { success: true, data: { categoryId: category.id } };
  } catch (error) {
    console.error("Error creating expense category:", error);
    return { success: false, error: "Erro ao criar categoria de despesa" };
  }
}
