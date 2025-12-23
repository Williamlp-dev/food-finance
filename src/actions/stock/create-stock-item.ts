"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type StockItemFormData, stockItemSchema } from "./types";

export async function createStockItem(
  data: StockItemFormData
): Promise<ActionResult<{ itemId: string }>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = stockItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  /* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
  const { Prisma } = await import("@prisma/client");

  const quantity = parsed.data.quantity;
  const unitCost = parsed.data.unitCost;
  // Calculate total safely using Decimal logic
  const totalValue = new Prisma.Decimal(unitCost).mul(quantity);

  try {
    const item = await prisma.stockItem.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        unit: parsed.data.unit,
        quantity,
        unitCost,
        totalValue,
        userId: session.user.id,
      },
    });

    updateTag(`stock-items-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);

    return { success: true, data: { itemId: item.id } };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" // Unique constraint failed
    ) {
      return {
        success: false,
        error: "Erro de validação",
        fieldErrors: {
          name: ["Já existe um item com este nome"],
        },
      };
    }
    console.error("Error creating stock item:", error);
    return { success: false, error: "Erro ao criar item de estoque" };
  }
}
