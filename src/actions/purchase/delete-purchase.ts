"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export async function deletePurchase(id: string): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const purchase = await prisma.purchase.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!purchase) {
    return { success: false, error: "Compra não encontrada" };
  }

  try {
    await prisma.purchase.delete({ where: { id } });

    updateTag(`purchases-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return { success: false, error: "Erro ao excluir compra" };
  }
}
