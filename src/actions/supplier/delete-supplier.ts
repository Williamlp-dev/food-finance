"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export async function deleteSupplier(id: string): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const supplier = await prisma.supplier.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!supplier) {
    return { success: false, error: "Fornecedor não encontrado" };
  }

  try {
    await prisma.supplier.delete({ where: { id } });

    updateTag(`suppliers-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "Erro ao excluir fornecedor" };
  }
}
