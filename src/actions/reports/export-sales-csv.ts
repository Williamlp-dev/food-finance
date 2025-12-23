"use server";

import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

export async function exportSalesCSV(
  year: number,
  month: number
): Promise<string> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const sales = await prisma.sale.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "desc" },
  });

  const headers = ["Data", "Valor Total", "Forma de Pagamento", "Observações"];
  const rows = sales.map((sale) => [
    new Date(sale.date).toLocaleDateString("pt-BR"),
    `R$ ${sale.totalValue.toString()}`,
    sale.paymentMethod,
    sale.notes || "",
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}
