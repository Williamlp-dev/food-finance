"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export async function deleteEmployee(
  employeeId: string
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    await prisma.employee.delete({
      where: {
        id: employeeId,
        userId: session.user.id,
      },
    });

    updateTag(`employees-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, error: "Erro ao excluir funcionário" };
  }
}
