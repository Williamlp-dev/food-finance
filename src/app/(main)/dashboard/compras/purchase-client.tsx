"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deletePurchase } from "@/actions/purchase/delete-purchase";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
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
import { PurchaseForm } from "./purchase-form";

type Purchase = {
  id: string;
  date: Date;
  paymentMethod: string;
  notes: string | null;
  total: string;
  supplier: { id: string; name: string };
  items: {
    id: string;
    quantity: number;
    unitPrice: string;
    total: string;
    stockItem: { id: string; name: string; unit: string };
  }[];
  createdAt: Date;
};

type Supplier = { id: string; name: string };
type StockItem = { id: string; name: string; unit: string };

type PurchaseClientProps = {
  initialPurchases: Purchase[];
  suppliers: Supplier[];
  stockItems: StockItem[];
};

const paymentMethodLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  boleto: "Boleto",
  transferencia: "Transferência",
};

export function PurchaseClient({
  initialPurchases,
  suppliers,
  stockItems,
}: PurchaseClientProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [deletingPurchase, setDeletingPurchase] = useState<Purchase | null>(
    null
  );

  async function handleDelete(): Promise<void> {
    if (!deletingPurchase) {
      return;
    }

    const result = await deletePurchase(deletingPurchase.id);

    if (result.success) {
      toast.success("Compra excluída com sucesso!");
    } else {
      toast.error(result.error || "Erro ao excluir compra");
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
            <ShoppingCart className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate">Compras</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Gerencie suas compras e pedidos.
          </p>
        </div>

        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button className="w-full shrink-0 sm:w-auto">
              <Plus className="mr-2 size-4" />
              Nova Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Compra</DialogTitle>
              <DialogDescription>
                Preencha os dados da compra abaixo.
              </DialogDescription>
            </DialogHeader>
            <PurchaseForm
              onCancel={() => setOpen(false)}
              onSuccess={handleSuccess}
              stockItems={stockItems}
              suppliers={suppliers}
            />
          </DialogContent>
        </Dialog>
      </header>

      <ConfirmDeleteDialog
        description={`Tem certeza que deseja excluir a compra de ${deletingPurchase ? format(new Date(deletingPurchase.date), "dd/MM/yyyy", { locale: ptBR }) : ""}? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onOpenChange={() => setDeletingPurchase(null)}
        open={!!deletingPurchase}
        title="Excluir compra"
      />

      {initialPurchases.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhuma compra registrada. Clique em "Nova Compra" para adicionar.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    {format(new Date(purchase.date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {purchase.supplier.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {paymentMethodLabels[purchase.paymentMethod] ||
                        purchase.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>{purchase.items.length} item(s)</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(Number(purchase.total))}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Eye className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes da Compra</DialogTitle>
                            <DialogDescription>
                              Compra de{" "}
                              {format(new Date(purchase.date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Fornecedor:
                                </span>
                                <p className="font-medium">
                                  {purchase.supplier.name}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Pagamento:
                                </span>
                                <p className="font-medium">
                                  {paymentMethodLabels[purchase.paymentMethod]}
                                </p>
                              </div>
                            </div>
                            {purchase.notes ? (
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Observações:
                                </span>
                                <p>{purchase.notes}</p>
                              </div>
                            ) : null}
                            <div>
                              <span className="text-muted-foreground text-sm">
                                Itens:
                              </span>
                              <div className="mt-2 space-y-2">
                                {purchase.items.map((item) => (
                                  <div
                                    className="flex justify-between rounded border p-2 text-sm"
                                    key={item.id}
                                  >
                                    <span>
                                      {item.stockItem.name} ({item.quantity}{" "}
                                      {item.stockItem.unit})
                                    </span>
                                    <span className="font-medium">
                                      {formatPrice(Number(item.total))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end border-t pt-2">
                              <span className="font-semibold text-lg">
                                Total: {formatPrice(Number(purchase.total))}
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => setDeletingPurchase(purchase)}
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
