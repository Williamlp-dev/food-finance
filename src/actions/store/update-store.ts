"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type StoreFormData, storeSchema } from "./types";

export async function updateStore(
  data: StoreFormData
): Promise<ActionResult<{ storeId: string }>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = storeSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const store = await prisma.store.upsert({
      where: { userId: session.user.id },
      update: {
        name: parsed.data.name,
        cnpj: parsed.data.cnpj || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
      },
      create: {
        name: parsed.data.name,
        cnpj: parsed.data.cnpj || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        userId: session.user.id,
      },
    });

    updateTag(`store-${session.user.id}`);

    return { success: true, data: { storeId: store.id } };
  } catch (error) {
    console.error("Error updating store:", error);
    return { success: false, error: "Erro ao atualizar dados da loja" };
  }
}
