"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export type PaymentDetails = {
  id: string;
  date: Date;
  description: string | null;
  grossValue: number;
  discounts: number;
  netValue: number;
  employee: {
    name: string;
    cpf: string | null;
    role: string;
  };
};

async function fetchPaymentDetails(paymentId: string, userId: string) {
  "use cache";
  cacheTag(`payment-${paymentId}`);

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      userId,
    },
    include: {
      employee: {
        select: {
          name: true,
          cpf: true,
          role: true,
        },
      },
    },
  });

  if (!payment) {
    return null;
  }

  return {
    id: payment.id,
    date: payment.date,
    description: payment.description,
    grossValue: Number(payment.grossValue),
    discounts: Number(payment.discounts),
    netValue: Number(payment.netValue),
    employee: payment.employee,
  };
}

export async function getPaymentDetails(
  paymentId: string
): Promise<ActionResult<PaymentDetails | null>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const payment = await fetchPaymentDetails(paymentId, session.user.id);
    return { success: true, data: payment };
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return { success: false, error: "Erro ao buscar detalhes do pagamento" };
  }
}
