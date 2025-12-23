"use server";

import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";
import { type EmployeeFormData, employeeSchema } from "./types";

export async function createEmployee(
  data: EmployeeFormData
): Promise<ActionResult<{ employeeId: string }>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  const parsed = employeeSchema.safeParse(data);

  console.log("[DEBUG] Raw data received:", JSON.stringify(data, null, 2));
  console.log(
    "[DEBUG] baseSalary raw:",
    data.baseSalary,
    "type:",
    typeof data.baseSalary
  );

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, cpf, phone, role, baseSalary } = parsed.data;

  console.log(
    "[DEBUG] Parsed baseSalary:",
    baseSalary,
    "type:",
    typeof baseSalary
  );

  try {
    const employee = await prisma.employee.create({
      data: {
        name,
        cpf,
        phone,
        role,
        baseSalary,
        userId: session.user.id,
      },
    });

    updateTag(`employees-${session.user.id}`);
    updateTag(`backup-summary-${session.user.id}`);
    return { success: true, data: { employeeId: employee.id } };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false, error: "Erro ao criar funcionário" };
  }
}
