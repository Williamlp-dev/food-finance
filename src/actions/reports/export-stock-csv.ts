"use server";

import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

export async function exportStockCSV(): Promise<string> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const stockItems = await prisma.stockItem.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { name: "asc" },
  });

  const headers = [
    "Nome",
    "Descrição",
    "Quantidade",
    "Unidade",
    "Custo Unitário",
    "Valor Total",
  ];
  const rows = stockItems.map((item) => [
    item.name,
    item.description || "",
    item.quantity.toString(),
    item.unit,
    `R$ ${item.unitCost.toString()}`,
    `R$ ${item.totalValue.toString()}`,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}
