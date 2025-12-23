"use server";

import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

export async function exportSuppliersCSV(): Promise<string> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const suppliers = await prisma.supplier.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { name: "asc" },
  });

  const headers = ["Nome", "Telefone", "Email", "Endereço"];
  const rows = suppliers.map((supplier) => [
    supplier.name,
    supplier.phone || "",
    supplier.email || "",
    supplier.address || "",
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}
