"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Eye, FolderEdit, Plus, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/actions/expense/delete-expense";
import { createExpenseCategory } from "@/actions/expense-category/create-expense-category";
import { deleteExpenseCategory } from "@/actions/expense-category/delete-expense-category";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { ExpenseForm } from "./expense-form";

type Expense = {
  id: string;
  description: string | null;
  value: string;
  date: Date;
  paymentMethod: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: Date;
};

type ExpenseCategory = {
  id: string;
  name: string;
  createdAt: Date;
};

type ExpenseClientProps = {
  initialExpenses: Expense[];
  categories: ExpenseCategory[];
};

const paymentMethodLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  boleto: "Boleto",
  transferencia: "Transferência",
};

export function ExpenseClient({
  initialExpenses,
  categories,
}: ExpenseClientProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<ExpenseCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  async function handleDeleteExpense(): Promise<void> {
    if (!deletingExpense) {
      return;
    }

    const result = await deleteExpense(deletingExpense.id);

    if (result.success) {
      toast.success("Despesa excluída com sucesso!");
    } else {
      toast.error(result.error || "Erro ao excluir despesa");
    }
  }

  async function handleDeleteCategory(): Promise<void> {
    if (!deletingCategory) {
      return;
    }

    const result = await deleteExpenseCategory(deletingCategory.id);

    if (result.success) {
      toast.success("Categoria excluída com sucesso!");
    } else {
      toast.error(result.error || "Erro ao excluir categoria");
    }
  }

  async function handleCreateCategory(): Promise<void> {
    if (!newCategoryName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    setIsCreatingCategory(true);
    const result = await createExpenseCategory({ name: newCategoryName });

    if (result.success) {
      toast.success("Categoria criada com sucesso!");
      setNewCategoryName("");
    } else {
      toast.error(result.error || "Erro ao criar categoria");
    }

    setIsCreatingCategory(false);
  }

  function handleSuccess(): void {
    setOpen(false);
    setEditingExpense(null);
  }

  return (
    <div className="max-w-full space-y-6">
      <header className="flex max-w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
            <Receipt className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate">Despesas</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Controle de despesas e gastos.
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Dialog onOpenChange={setCategoriesOpen} open={categoriesOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none" variant="outline">
                <FolderEdit className="mr-2 size-4" />
                Categorias
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerenciar Categorias</DialogTitle>
                <DialogDescription>
                  Adicione ou remova categorias de despesas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateCategory();
                      }
                    }}
                    placeholder="Nome da nova categoria"
                    value={newCategoryName}
                  />
                  <Button
                    disabled={isCreatingCategory}
                    onClick={handleCreateCategory}
                    type="button"
                  >
                    {isCreatingCategory ? "Criando..." : "Criar"}
                  </Button>
                </div>

                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="py-4 text-center text-muted-foreground text-sm">
                      Nenhuma categoria criada
                    </p>
                  ) : (
                    categories.map((category) => (
                      <div
                        className="flex items-center justify-between rounded border p-3"
                        key={category.id}
                      >
                        <span className="font-medium">{category.name}</span>
                        <Button
                          onClick={() => setDeletingCategory(category)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) {
                setEditingExpense(null);
              }
            }}
            open={open}
          >
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none">
                <Plus className="mr-2 size-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Editar Despesa" : "Nova Despesa"}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense
                    ? "Atualize os dados da despesa abaixo."
                    : "Preencha os dados da despesa abaixo."}
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm
                categories={categories.map((c) => ({ id: c.id, name: c.name }))}
                initialData={
                  editingExpense
                    ? {
                        id: editingExpense.id,
                        categoryId: editingExpense.category.id,
                        description: editingExpense.description,
                        value: editingExpense.value,
                        date: editingExpense.date,
                        paymentMethod: editingExpense.paymentMethod,
                      }
                    : undefined
                }
                onCancel={() => {
                  setOpen(false);
                  setEditingExpense(null);
                }}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <ConfirmDeleteDialog
        description="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteExpense}
        onOpenChange={() => setDeletingExpense(null)}
        open={!!deletingExpense}
        title="Excluir despesa"
      />

      <ConfirmDeleteDialog
        description="Tem certeza que deseja excluir esta categoria? As despesas associadas não serão excluídas, mas ficarão sem categoria."
        onConfirm={handleDeleteCategory}
        onOpenChange={() => setDeletingCategory(null)}
        open={!!deletingCategory}
        title="Excluir categoria"
      />

      {initialExpenses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhuma despesa registrada. Clique em "Nova Despesa" para adicionar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {format(new Date(expense.date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {expense.category.name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {expense.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {paymentMethodLabels[expense.paymentMethod] ||
                        expense.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(Number(expense.value))}
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
                            <DialogTitle>Detalhes da Despesa</DialogTitle>
                            <DialogDescription>
                              Despesa de{" "}
                              {format(new Date(expense.date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Categoria:
                                </span>
                                <p className="font-medium">
                                  {expense.category.name}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Pagamento:
                                </span>
                                <p className="font-medium">
                                  {paymentMethodLabels[expense.paymentMethod]}
                                </p>
                              </div>
                            </div>
                            {expense.description ? (
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Descrição:
                                </span>
                                <p>{expense.description}</p>
                              </div>
                            ) : null}
                            <div className="flex justify-end border-t pt-2">
                              <span className="font-semibold text-lg">
                                Total: {formatPrice(Number(expense.value))}
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => {
                          setEditingExpense(expense);
                          setOpen(true);
                        }}
                        size="icon"
                        variant="ghost"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        onClick={() => setDeletingExpense(expense)}
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
