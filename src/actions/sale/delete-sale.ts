"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export async function deleteSale(saleId: string): Promise<ActionResult<void>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    await prisma.sale.delete({
      where: {
        id: saleId,
        userId: session.user.id,
      },
    });

    updateTag(`sales-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting sale:", error);
    return { success: false, error: "Erro ao excluir venda" };
  }
}
