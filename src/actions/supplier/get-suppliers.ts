"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

export type SupplierResult = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
};

// Função interna cacheada
async function fetchGenericSuppliers(userId: string) {
  "use cache";
  cacheTag(`suppliers-${userId}`);

  const suppliers = await prisma.supplier.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      createdAt: true,
    },
  });

  return suppliers;
}

export async function getSuppliers(): Promise<ActionResult<SupplierResult[]>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const suppliers = await fetchGenericSuppliers(session.user.id);
    return { success: true, data: suppliers };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { success: false, error: "Erro ao buscar fornecedores" };
  }
}
