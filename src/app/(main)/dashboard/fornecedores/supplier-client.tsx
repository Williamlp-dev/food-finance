"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSupplier } from "@/actions/supplier/delete-supplier";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupplierForm } from "./supplier-form";

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
};

type SupplierClientProps = {
  initialSuppliers: Supplier[];
};

export function SupplierClient({
  initialSuppliers,
}: SupplierClientProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(
    null
  );

  async function handleDelete(): Promise<void> {
    if (!deletingSupplier) {
      return;
    }

    try {
      const result = await deleteSupplier(deletingSupplier.id);

      if (result.success) {
        toast.success("Fornecedor excluído com sucesso!");
        setDeletingSupplier(null);
      } else {
        toast.error(result.error || "Erro ao excluir fornecedor");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao excluir");
    }
  }

  function handleSuccess(): void {
    setOpen(false);
  }

  return (
    <div className="max-w-full space-y-6">
      <header className="flex max-w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
            <Truck className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate">Fornecedores</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Gerencie seus fornecedores e parceiros.
          </p>
        </div>

        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button className="w-full shrink-0 sm:w-auto">
              <Plus className="mr-2 size-4" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Fornecedor</DialogTitle>
              <DialogDescription>
                Preencha os dados do fornecedor abaixo.
              </DialogDescription>
            </DialogHeader>
            <SupplierForm
              onCancel={() => setOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </header>

      <ConfirmDeleteDialog
        description={`Tem certeza que deseja excluir "${deletingSupplier?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onOpenChange={() => setDeletingSupplier(null)}
        open={!!deletingSupplier}
        title="Excluir fornecedor"
      />

      {initialSuppliers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum fornecedor cadastrado. Clique em "Novo Fornecedor" para
            adicionar.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.phone || "-"}</TableCell>
                  <TableCell>{supplier.email || "-"}</TableCell>
                  <TableCell>{supplier.address || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(supplier.createdAt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => setDeletingSupplier(supplier)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
