"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export async function deletePayment(
  paymentId: string
): Promise<ActionResult<void>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    await prisma.payment.delete({
      where: {
        id: paymentId,
        userId: session.user.id,
      },
    });

    updateTag(`payments-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error: "Erro ao excluir pagamento" };
  }
}
