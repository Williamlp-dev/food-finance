"use server";

import { setTimeout } from "node:timers/promises";
import { forbidden, unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";

export async function deleteApplication() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }

  if (user.role !== "admin") {
    forbidden();
  }

  await setTimeout(800);
}
