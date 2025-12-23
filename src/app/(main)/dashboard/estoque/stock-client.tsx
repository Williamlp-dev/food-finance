"use client";

import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteStockItem } from "@/actions/stock/delete-stock-item";
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
import { formatPrice } from "@/lib/utils";
import { StockItemForm } from "./stock-item-form";

type StockItem = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  quantity: number;
  unitCost: string;
  totalValue: string;
  createdAt: Date;
};

type StockClientProps = {
  initialItems: StockItem[];
};

export function StockClient({
  initialItems,
}: StockClientProps): React.ReactElement {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<StockItem | null>(null);

  async function handleDelete(): Promise<void> {
    if (!deletingItem) {
      return;
    }

    try {
      const result = await deleteStockItem(deletingItem.id);

      if (result.success) {
        toast.success("Item excluído com sucesso!");
        setDeletingItem(null);
      } else {
        toast.error(result.error || "Erro ao excluir item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao excluir");
    }
  }

  function handleCreateSuccess(): void {
    setCreateOpen(false);
  }

  function handleEditSuccess(): void {
    setEditingItem(null);
  }

  return (
    <div className="max-w-full space-y-6">
      <header className="flex max-w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
            <Package className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate">Estoque</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Gerencie os itens do seu estoque.
          </p>
        </div>

        <Dialog onOpenChange={setCreateOpen} open={createOpen}>
          <DialogTrigger asChild>
            <Button className="w-full shrink-0 sm:w-auto">
              <Plus className="mr-2 size-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Item</DialogTitle>
              <DialogDescription>
                Preencha os dados do item abaixo.
              </DialogDescription>
            </DialogHeader>
            <StockItemForm
              onCancel={() => setCreateOpen(false)}
              onSuccess={handleCreateSuccess}
            />
          </DialogContent>
        </Dialog>
      </header>

      <Dialog onOpenChange={() => setEditingItem(null)} open={!!editingItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Atualize os dados do item abaixo.
            </DialogDescription>
          </DialogHeader>
          {editingItem ? (
            <StockItemForm
              item={editingItem}
              onCancel={() => setEditingItem(null)}
              onSuccess={handleEditSuccess}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        description={`Tem certeza que deseja excluir "${deletingItem?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onOpenChange={() => setDeletingItem(null)}
        open={!!deletingItem}
        title="Excluir item"
      />

      {initialItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum item cadastrado. Clique em "Novo Item" para adicionar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Custo Unit.</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description ? (
                        <p className="text-muted-foreground text-sm">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(Number(item.unitCost))}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(Number(item.totalValue))}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => setEditingItem(item)}
                        size="icon"
                        variant="ghost"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        onClick={() => setDeletingItem(item)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
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
