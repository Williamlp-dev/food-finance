"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSale } from "@/actions/sale/delete-sale";
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
import { SaleForm } from "./sale-form";

type Sale = {
  id: string;
  date: Date;
  totalValue: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date;
};

type SaleClientProps = {
  initialSales: Sale[];
};

const paymentMethodLabels: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  misto: "Misto",
};

export function SaleClient({
  initialSales,
}: SaleClientProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);

  async function handleDelete(): Promise<void> {
    if (!deletingSale) {
      return;
    }

    const result = await deleteSale(deletingSale.id);

    if (result.success) {
      toast.success("Venda excluída com sucesso!");
    } else {
      toast.error(result.error || "Erro ao excluir venda");
    }
  }

  function handleSuccess(): void {
    setOpen(false);
    setEditingSale(null);
  }

  return (
    <div className="max-w-full space-y-6">
      <header className="flex max-w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
            <DollarSign className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate">Vendas</span>
          </h1>
          <p className="mt-1 truncate text-muted-foreground text-sm">
            Gerencie as vendas da hamburgueria.
          </p>
        </div>

        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button className="w-full shrink-0 sm:w-auto">
              <Plus className="mr-2 size-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSale ? "Editar Venda" : "Nova Venda"}
              </DialogTitle>
              <DialogDescription>
                {editingSale
                  ? "Atualize os dados da venda abaixo."
                  : "Preencha os dados da venda abaixo."}
              </DialogDescription>
            </DialogHeader>
            <SaleForm
              initialData={
                editingSale
                  ? {
                      id: editingSale.id,
                      date: editingSale.date,
                      totalValue: editingSale.totalValue,
                      paymentMethod: editingSale.paymentMethod,
                      notes: editingSale.notes,
                    }
                  : undefined
              }
              onCancel={() => {
                setOpen(false);
                setEditingSale(null);
              }}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </header>

      <ConfirmDeleteDialog
        description="Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onOpenChange={() => setDeletingSale(null)}
        open={!!deletingSale}
        title="Excluir venda"
      />

      {initialSales.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhuma venda registrada. Clique em "Nova Venda" para adicionar.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {format(new Date(sale.date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {paymentMethodLabels[sale.paymentMethod] ||
                        sale.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {sale.notes || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(Number(sale.totalValue))}
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
                            <DialogTitle>Detalhes da Venda</DialogTitle>
                            <DialogDescription>
                              Venda de{" "}
                              {format(new Date(sale.date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Data:
                                </span>
                                <p className="font-medium">
                                  {format(new Date(sale.date), "PPP", {
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Pagamento:
                                </span>
                                <p className="font-medium">
                                  {paymentMethodLabels[sale.paymentMethod]}
                                </p>
                              </div>
                            </div>
                            {sale.notes ? (
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Observações:
                                </span>
                                <p>{sale.notes}</p>
                              </div>
                            ) : null}
                            <div className="flex justify-end border-t pt-2">
                              <span className="font-semibold text-lg">
                                Total: {formatPrice(Number(sale.totalValue))}
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => {
                          setEditingSale(sale);
                          setOpen(true);
                        }}
                        size="icon"
                        variant="ghost"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        onClick={() => setDeletingSale(sale)}
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
