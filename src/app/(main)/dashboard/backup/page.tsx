import { Database } from "lucide-react";
import type { Metadata } from "next";
import { getBackupSummary } from "@/actions/backup/get-backup-summary";
import { BackupClient } from "./backup-client";

export const metadata: Metadata = {
  title: "Backup",
};

export default async function BackupPage(): Promise<React.ReactElement> {
  const summaryResult = await getBackupSummary();
  const summary = summaryResult.success
    ? summaryResult.data
    : {
        suppliers: 0,
        purchases: 0,
        stockItems: 0,
        employees: 0,
        payments: 0,
        expenses: 0,
        sales: 0,
      };

  return (
    <div className="max-w-full space-y-6">
      <header className="max-w-full">
        <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
          <Database className="size-5 shrink-0 text-muted-foreground" />
          <span className="truncate">Backup</span>
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Faça backup dos seus dados ou restaure
        </p>
      </header>

      <BackupClient summary={summary} />
    </div>
  );
}
