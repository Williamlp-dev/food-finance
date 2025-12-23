"use server";

import { Prisma } from "@prisma/client";
import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type StockItemFormData, stockItemSchema } from "./types";

export async function updateStockItem(
  id: string,
  data: StockItemFormData
): Promise<ActionResult> {
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

  const existingItem = await prisma.stockItem.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existingItem) {
    return { success: false, error: "Item não encontrado" };
  }

  const quantity = parsed.data.quantity;
  const unitCost = parsed.data.unitCost;
  const totalValue = new Prisma.Decimal(unitCost).mul(quantity);

  try {
    await prisma.stockItem.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        unit: parsed.data.unit,
        quantity,
        unitCost,
        totalValue,
      },
    });

    updateTag(`stock-items-${session.user.id}`);

    return { success: true, data: undefined };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "Já existe um item com este nome", // Return error alongside for type satisfaction
        fieldErrors: {
          name: ["Já existe um item com este nome"],
        },
      };
    }
    console.error("Error updating stock item:", error);
    return { success: false, error: "Erro ao atualizar item de estoque" };
  }
}
