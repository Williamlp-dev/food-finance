"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

type Store = {
  id: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
};

async function fetchStore(userId: string) {
  "use cache";
  cacheTag(`store-${userId}`);

  const store = await prisma.store.findUnique({
    where: { userId },
  });

  return store;
}

export async function getStore(): Promise<ActionResult<Store | null>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const store = await fetchStore(session.user.id);
    return { success: true, data: store };
  } catch (error) {
    console.error("Error getting store:", error);
    return { success: false, error: "Erro ao buscar dados da loja" };
  }
}
