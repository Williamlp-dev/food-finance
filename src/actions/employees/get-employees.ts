"use server";

import { cacheTag } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "../types";

import type { Employee } from "./types";

async function fetchGenericEmployees(userId: string) {
  "use cache";
  cacheTag(`employees-${userId}`);

  const employees = await prisma.employee.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  return employees.map((e) => ({
    ...e,
    baseSalary: Number(e.baseSalary),
  }));
}

export async function getEmployees(): Promise<ActionResult<Employee[]>> {
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  try {
    const employees = await fetchGenericEmployees(session.user.id);
    return { success: true, data: employees };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false, error: "Erro ao buscar funcionários" };
  }
}
