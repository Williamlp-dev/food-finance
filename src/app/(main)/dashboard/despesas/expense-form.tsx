"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createExpense } from "@/actions/expense/create-expense";
import { updateExpense } from "@/actions/expense/update-expense";
import { createExpenseCategory } from "@/actions/expense-category/create-expense-category";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ExpenseCategory = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  description: string | null;
  value: string;
  date: Date;
  paymentMethod: string;
  categoryId: string;
};

type ExpenseFormProps = {
  categories: ExpenseCategory[];
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Expense;
};

const formSchema = z.object({
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
  value: z.string().min(1, "Valor é obrigatório"),
  date: z.date(),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

const paymentMethods = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
];

export function ExpenseForm({
  categories,
  onSuccess,
  onCancel,
  initialData,
}: ExpenseFormProps): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const isEditing = !!initialData;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      description: "",
      value: "",
      date: new Date(),
      paymentMethod: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        categoryId: initialData.categoryId,
        description: initialData.description || "",
        value: initialData.value,
        date: new Date(initialData.date),
        paymentMethod: initialData.paymentMethod,
      });
    }
  }, [initialData, form]);

  async function handleCreateCategory(): Promise<void> {
    if (!newCategory.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    setIsCreatingCategory(true);
    const result = await createExpenseCategory({ name: newCategory });

    if (result.success) {
      toast.success("Categoria criada com sucesso!");
      setNewCategory("");
      setShowCategoryInput(false);
    } else {
      toast.error(result.error || "Erro ao criar categoria");
    }

    setIsCreatingCategory(false);
  }

  async function onSubmit(data: FormData): Promise<void> {
    setIsSubmitting(true);

    const expenseData = {
      categoryId: data.categoryId,
      description: data.description,
      value: Number.parseFloat(data.value),
      date: data.date,
      paymentMethod: data.paymentMethod,
    };

    const result = isEditing
      ? await updateExpense(initialData.id, expenseData)
      : await createExpense(expenseData);

    if (result.success) {
      toast.success(
        isEditing
          ? "Despesa atualizada com sucesso!"
          : "Despesa criada com sucesso!"
      );
      onSuccess();
    } else {
      toast.error(result.error || "Erro ao salvar despesa");
    }

    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria *</FormLabel>
              <div className="flex gap-2">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setShowCategoryInput(!showCategoryInput)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              {showCategoryInput ? (
                <div className="mt-2 flex gap-2">
                  <Input
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nova categoria"
                    value={newCategory}
                  />
                  <Button
                    disabled={isCreatingCategory}
                    onClick={handleCreateCategory}
                    size="sm"
                    type="button"
                  >
                    {isCreatingCategory ? "Criando..." : "Criar"}
                  </Button>
                </div>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes da despesa (opcional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor *</FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      variant="outline"
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto size-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    initialFocus
                    locale={ptBR}
                    mode="single"
                    onSelect={field.onChange}
                    selected={field.value}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de Pagamento *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onCancel} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {(() => {
              if (isSubmitting) {
                return isEditing ? "Salvando..." : "Criando...";
              }
              return isEditing ? "Salvar" : "Criar Despesa";
            })()}
          </Button>
        </div>
      </form>
    </Form>
  );
}
