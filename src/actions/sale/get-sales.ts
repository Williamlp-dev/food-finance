"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

type Sale = {
  id: string;
  date: Date;
  totalValue: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date;
};

async function fetchGenericSales(userId: string) {
  "use cache";
  cacheTag(`sales-${userId}`);

  const sales = await prisma.sale.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return sales.map((sale) => ({
    ...sale,
    totalValue: sale.totalValue.toString(),
  }));
}

export async function getSales(): Promise<ActionResult<Sale[]>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const sales = await fetchGenericSales(session.user.id);
    return { success: true, data: sales };
  } catch (error) {
    console.error("Error getting sales:", error);
    return { success: false, error: "Erro ao buscar vendas" };
  }
}
