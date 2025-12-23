"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export type PurchaseResult = {
  id: string;
  date: Date;
  paymentMethod: string;
  notes: string | null;
  total: string;
  supplier: { id: string; name: string };
  items: {
    id: string;
    quantity: number;
    unitPrice: string;
    total: string;
    stockItem: { id: string; name: string; unit: string };
  }[];
  createdAt: Date;
};

// Função interna cacheada
async function fetchGenericPurchases(userId: string) {
  "use cache";
  cacheTag(`purchases-${userId}`);

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      items: {
        include: {
          stockItem: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  });

  return purchases.map((purchase) => ({
    ...purchase,
    total: purchase.total.toString(),
    items: purchase.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
      total: item.total.toString(),
    })),
  }));
}

export async function getPurchases(): Promise<ActionResult<PurchaseResult[]>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const purchases = await fetchGenericPurchases(session.user.id);
    return { success: true, data: purchases };
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return { success: false, error: "Erro ao buscar compras" };
  }
}
