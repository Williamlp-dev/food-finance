"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import type { z } from "zod";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { createPaymentSchema } from "./schema";

export async function createPayment(
  data: z.infer<typeof createPaymentSchema>
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parseResult = createPaymentSchema.safeParse(data);

  if (!parseResult.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { employeeId, date, description, grossValue, discounts } =
    parseResult.data;
  const netValue = grossValue - discounts;

  try {
    await prisma.payment.create({
      data: {
        employeeId,
        date,
        description,
        grossValue,
        discounts,
        netValue,
        userId: session.user.id,
      },
    });

    updateTag(`payments-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: "Erro ao registrar pagamento" };
  }
}
