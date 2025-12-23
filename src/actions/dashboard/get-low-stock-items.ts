"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import type { LowStockItem } from "./types";

async function fetchLowStockItems(userId: string) {
  "use cache";
  cacheTag(`low-stock-${userId}`);

  const items = await prisma.stockItem.findMany({
    where: {
      userId,
      quantity: {
        lte: 1,
      },
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      unit: true,
    },
    orderBy: {
      quantity: "asc",
    },
    take: 10,
  });

  return items;
}

export async function getLowStockItems(): Promise<
  ActionResult<LowStockItem[]>
> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const items = await fetchLowStockItems(session.user.id);
    return { success: true, data: items };
  } catch (error) {
    console.error("Error getting low stock items:", error);
    return { success: false, error: "Erro ao buscar items com estoque baixo" };
  }
}
