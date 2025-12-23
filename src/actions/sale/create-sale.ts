"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type SaleFormData, saleSchema } from "./types";

export async function createSale(
  data: SaleFormData
): Promise<ActionResult<{ saleId: string }>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = saleSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const sale = await prisma.sale.create({
      data: {
        date: parsed.data.date,
        totalValue: parsed.data.totalValue,
        paymentMethod: parsed.data.paymentMethod,
        notes: parsed.data.notes || null,
        userId: session.user.id,
      },
    });

    updateTag(`sales-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: { saleId: sale.id } };
  } catch (error) {
    console.error("Error creating sale:", error);
    return { success: false, error: "Erro ao criar venda" };
  }
}
