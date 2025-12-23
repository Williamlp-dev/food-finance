"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

type ExpenseCategory = {
  id: string;
  name: string;
  createdAt: Date;
};

async function fetchGenericExpenseCategories(userId: string) {
  "use cache";
  cacheTag(`expense-categories-${userId}`);

  const categories = await prisma.expenseCategory.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return categories;
}

export async function getExpenseCategories(): Promise<
  ActionResult<ExpenseCategory[]>
> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const categories = await fetchGenericExpenseCategories(session.user.id);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error getting expense categories:", error);
    return { success: false, error: "Erro ao buscar categorias de despesas" };
  }
}
