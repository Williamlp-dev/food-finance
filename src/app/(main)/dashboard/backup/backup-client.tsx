"use client";

import { Database, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { exportBackup } from "@/actions/backup/export-backup";
import { importBackup } from "@/actions/backup/import-backup";
import type { BackupSummary } from "@/actions/backup/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type BackupClientProps = {
  summary: BackupSummary;
};

export function BackupClient({
  summary,
}: BackupClientProps): React.ReactElement {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport(): Promise<void> {
    setIsExporting(true);

    const result = await exportBackup();

    if (result.success && result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup exportado com sucesso!");
    } else {
      toast.error(result.success ? "Erro ao exportar backup" : result.error);
    }

    setIsExporting(false);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        toast.error("Arquivo deve ser do tipo JSON");
        return;
      }
      setSelectedFile(file);
      setShowRestoreDialog(true);
    }
  }

  async function handleImport(): Promise<void> {
    if (!selectedFile) {
      return;
    }

    setIsImporting(true);
    setShowRestoreDialog(false);

    try {
      const fileContent = await selectedFile.text();
      const result = await importBackup(fileContent);

      if (result.success) {
        toast.success("Backup restaurado com sucesso!");
        window.location.reload();
      } else {
        toast.error(result.error || "Erro ao restaurar backup");
      }
    } catch {
      toast.error("Erro ao ler o arquivo de backup");
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="max-w-full space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <Database className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm">Resumo dos Dados</h2>
            <p className="truncate text-muted-foreground text-xs">
              Dados armazenados localmente no navegador
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Fornecedores</p>
          <p className="mt-2 font-bold text-2xl">{summary.suppliers}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Compras</p>
          <p className="mt-2 font-bold text-2xl">{summary.purchases}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Itens Estoque</p>
          <p className="mt-2 font-bold text-2xl">{summary.stockItems}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Funcionários</p>
          <p className="mt-2 font-bold text-2xl">{summary.employees}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Pagamentos</p>
          <p className="mt-2 font-bold text-2xl">{summary.payments}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Despesas</p>
          <p className="mt-2 font-bold text-2xl">{summary.expenses}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-muted-foreground text-xs">Vendas</p>
          <p className="mt-2 font-bold text-2xl">{summary.sales}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="shrink-0">
              <Download className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">Exportar Backup</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Baixe um arquivo JSON com todos os dados do sistema. Guarde em
                local seguro.
              </p>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={isExporting}
            onClick={handleExport}
          >
            <Download className="mr-2 size-4" />
            {isExporting ? "Exportando..." : "Baixar Backup"}
          </Button>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="shrink-0">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">Restaurar Backup</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Restaure os dados a partir de um arquivo de backup. Os dados
                atuais serão substituídos.
              </p>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <Upload className="mr-2 size-4" />
            {isImporting ? "Restaurando..." : "Selecionar Arquivo"}
          </Button>
          <input
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
            type="file"
          />
        </div>
      </div>

      <AlertDialog onOpenChange={setShowRestoreDialog} open={showRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá substituir todos os dados atuais do sistema pelos
              dados do arquivo de backup. Esta operação é irreversível.
              <br />
              <br />
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFile(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              Confirmar Restauração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
