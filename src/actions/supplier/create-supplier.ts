"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type SupplierFormData, supplierSchema } from "./types";

export async function createSupplier(
  data: SupplierFormData
): Promise<ActionResult<{ supplierId: string }>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = supplierSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supplier = await prisma.supplier.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
        userId: session.user.id,
      },
    });

    updateTag(`suppliers-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: { supplierId: supplier.id } };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: "Erro ao criar fornecedor" };
  }
}
