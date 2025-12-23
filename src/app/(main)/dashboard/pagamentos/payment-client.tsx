"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Banknote, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "@/actions/employees/types";
import { deletePayment } from "@/actions/payments/delete-payment";
import { getPaymentDetails } from "@/actions/payments/get-payment-details";
import type { PaymentResult } from "@/actions/payments/get-payments";
import { getStore } from "@/actions/store/get-store";
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
import { generatePaymentReceipt } from "@/lib/generate-payment-pdf";
import { PaymentForm } from "./payment-form";

// Note: Ensure deletePayment action exists or remove deletion capability for now if not requested.
// Since user didn't request delete, I'll omit the delete action/button to save time/complexity and stick to requirements.
// But I will leave the structure ready.

type PaymentClientProps = {
  initialPayments: PaymentResult[];
  employees: Employee[];
};

export function PaymentClient({
  initialPayments,
  employees,
}: PaymentClientProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<PaymentResult | null>(
    null
  );

  async function handleDelete(): Promise<void> {
    if (!deletingPayment) {
      return;
    }

    const result = await deletePayment(deletingPayment.id);

    if (result.success) {
      toast.success("Pagamento excluído com sucesso!");
    } else {
      toast.error(result.error || "Erro ao excluir pagamento");
    }
  }

  function handleSuccess(): void {
    setOpen(false);
  }

  async function handleGeneratePDF(paymentId: string): Promise<void> {
    try {
      const [paymentResult, storeResult] = await Promise.all([
        getPaymentDetails(paymentId),
        getStore(),
      ]);

      if (!(paymentResult.success && paymentResult.data)) {
        toast.error("Erro ao buscar dados do pagamento");
        return;
      }

      if (!(storeResult.success && storeResult.data)) {
        toast.error(
          "Erro: Configure os dados da loja antes de gerar o recibo. Acesse Configurações > Dados da Loja."
        );
        return;
      }

      const receiptNumber = paymentId.slice(-6).toUpperCase();

      generatePaymentReceipt(
        paymentResult.data,
        storeResult.data,
        receiptNumber
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF do recibo");
    }
  }

  return (
    <div className="max-w-full space-y-6">
      <header className="flex max-w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
            <Banknote className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate">Pagamentos</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Gerencie os pagamentos dos seus funcionários.
          </p>
        </div>

        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button className="w-full shrink-0 sm:w-auto">
              <Plus className="mr-2 size-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
              <DialogDescription>
                Preencha os dados do pagamento abaixo. O valor líquido será
                calculado automaticamente.
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              employees={employees}
              onCancel={() => setOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </header>

      <ConfirmDeleteDialog
        description="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onOpenChange={() => setDeletingPayment(null)}
        open={!!deletingPayment}
        title="Excluir pagamento"
      />

      {initialPayments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum pagamento registrado. Clique em "Novo Pagamento" para
            adicionar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Bruto</TableHead>
                <TableHead>Descontos</TableHead>
                <TableHead>Líquido</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.employeeName}
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(payment.grossValue)}
                  </TableCell>
                  <TableCell className="text-red-500">
                    -{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(payment.discounts)}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(payment.netValue)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleGeneratePDF(payment.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <FileText className="size-4" />
                      </Button>
                      <Button
                        onClick={() => setDeletingPayment(payment)}
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
