"use server";

import { Prisma } from "@prisma/client";
import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export async function deleteStockItem(id: string): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const item = await prisma.stockItem.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!item) {
    return { success: false, error: "Item não encontrado" };
  }

  try {
    await prisma.stockItem.delete({ where: { id } });

    updateTag(`stock-items-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        error:
          "Não é possível excluir este item pois existem compras associadas a ele.",
      };
    }

    console.error("Error deleting stock item:", error);
    return { success: false, error: "Erro ao excluir item de estoque" };
  }
}
