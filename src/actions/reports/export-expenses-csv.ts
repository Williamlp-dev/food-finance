"use server";

import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

export async function exportExpensesCSV(
  year: number,
  month: number
): Promise<string> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      category: true,
    },
    orderBy: { date: "desc" },
  });

  const headers = [
    "Data",
    "Categoria",
    "Descrição",
    "Valor",
    "Forma de Pagamento",
  ];
  const rows = expenses.map((expense) => [
    new Date(expense.date).toLocaleDateString("pt-BR"),
    expense.category.name,
    expense.description || "",
    `R$ ${expense.value.toString()}`,
    expense.paymentMethod,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}
