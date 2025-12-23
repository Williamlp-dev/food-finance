"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type EmployeeFormData, employeeSchema } from "./types";

export async function updateEmployee(
  employeeId: string,
  data: EmployeeFormData
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = employeeSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, cpf, phone, role, baseSalary } = parsed.data;

  try {
    await prisma.employee.update({
      where: {
        id: employeeId,
        userId: session.user.id,
      },
      data: {
        name,
        cpf,
        phone,
        role,
        baseSalary,
      },
    });

    updateTag(`employees-${session.user.id}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { success: false, error: "Erro ao atualizar funcionário" };
  }
}
