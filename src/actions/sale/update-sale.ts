"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type SaleFormData, saleSchema } from "./types";

export async function updateSale(
  id: string,
  data: SaleFormData
): Promise<ActionResult<void>> {
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

  const existingSale = await prisma.sale.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existingSale) {
    return { success: false, error: "Venda não encontrada" };
  }

  try {
    await prisma.sale.update({
      where: { id },
      data: {
        date: parsed.data.date,
        totalValue: parsed.data.totalValue,
        paymentMethod: parsed.data.paymentMethod,
        notes: parsed.data.notes || null,
      },
    });

    updateTag(`sales-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating sale:", error);
    return { success: false, error: "Erro ao atualizar venda" };
  }
}
