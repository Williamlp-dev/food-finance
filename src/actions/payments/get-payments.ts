"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export type PaymentResult = {
  id: string;
  date: Date;
  description: string | null;
  grossValue: number;
  discounts: number;
  netValue: number;
  employeeName: string;
};

async function fetchGenericPayments(userId: string) {
  "use cache";
  cacheTag(`payments-${userId}`);

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: {
      employee: {
        select: {
          name: true,
        },
      },
    },
  });

  return payments.map((p) => ({
    id: p.id,
    date: p.date,
    description: p.description,
    grossValue: Number(p.grossValue),
    discounts: Number(p.discounts),
    netValue: Number(p.netValue),
    employeeName: p.employee.name,
  }));
}

export async function getPayments(): Promise<ActionResult<PaymentResult[]>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const payments = await fetchGenericPayments(session.user.id);
    return { success: true, data: payments };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, error: "Erro ao buscar pagamentos" };
  }
}
