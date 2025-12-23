"use server";

import { Prisma } from "@prisma/client";
import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type PurchaseFormData, purchaseSchema } from "./types";

export async function createPurchase(
  data: PurchaseFormData
): Promise<ActionResult<{ purchaseId: string }>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = purchaseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const total = parsed.data.items.reduce(
    (acc, item) =>
      acc.add(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
    new Prisma.Decimal(0)
  );

  try {
    const purchase = await prisma.purchase.create({
      data: {
        date: parsed.data.date,
        paymentMethod: parsed.data.paymentMethod,
        notes: parsed.data.notes || null,
        total,
        supplierId: parsed.data.supplierId,
        userId: session.user.id,
        items: {
          create: parsed.data.items.map((item) => ({
            stockItemId: item.stockItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: new Prisma.Decimal(item.unitPrice).mul(item.quantity),
          })),
        },
      },
    });

    updateTag(`purchases-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: { purchaseId: purchase.id } };
  } catch (error) {
    console.error("Error creating purchase:", error);
    return { success: false, error: "Erro ao criar compra" };
  }
}
