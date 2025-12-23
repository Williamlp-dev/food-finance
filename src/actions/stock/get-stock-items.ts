"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export type StockItemResult = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  quantity: number;
  unitCost: string;
  totalValue: string;
  createdAt: Date;
};

async function fetchGenericStockItems(userId: string) {
  "use cache";
  cacheTag(`stock-items-${userId}`);

  const items = await prisma.stockItem.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      unit: true,
      quantity: true,
      unitCost: true,
      totalValue: true,
      createdAt: true,
    },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity,
    unitCost: item.unitCost.toString(),
    totalValue: item.totalValue.toString(),
    createdAt: item.createdAt,
  }));
}

export async function getStockItems(): Promise<
  ActionResult<StockItemResult[]>
> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const items = await fetchGenericStockItems(session.user.id);
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching stock items:", error);
    return { success: false, error: "Erro ao buscar itens de estoque" };
  }
}
