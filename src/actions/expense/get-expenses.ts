"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

type Expense = {
  id: string;
  description: string | null;
  value: string;
  date: Date;
  paymentMethod: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: Date;
};

async function fetchGenericExpenses(userId: string) {
  "use cache";
  cacheTag(`expenses-${userId}`);

  const expenses = await prisma.expense.findMany({
    where: { userId },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return expenses.map((expense) => ({
    ...expense,
    value: expense.value.toString(),
  }));
}

export async function getExpenses(): Promise<ActionResult<Expense[]>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const expenses = await fetchGenericExpenses(session.user.id);
    return { success: true, data: expenses };
  } catch (error) {
    console.error("Error getting expenses:", error);
    return { success: false, error: "Erro ao buscar despesas" };
  }
}
