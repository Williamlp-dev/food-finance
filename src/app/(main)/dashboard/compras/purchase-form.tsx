"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { type Path, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createPurchase } from "@/actions/purchase/create-purchase";
import type { PurchaseFormData } from "@/actions/purchase/types";
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
import { cn, formatPrice, parseNumber } from "@/lib/utils";

const formSchema = z.object({
  supplierId: z.string().min(1, "Fornecedor é obrigatório"),
  date: z.date({ message: "Data é obrigatória" }),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        stockItemId: z.string().min(1, "Item é obrigatório"),
        quantity: z.string().min(1, "Quantidade é obrigatória"),
        unitPrice: z.string().min(1, "Valor é obrigatório"),
      })
    )
    .min(1, "Adicione pelo menos um item"),
});

type FormValues = z.infer<typeof formSchema>;

const paymentMethods = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência Bancária" },
];

type Supplier = { id: string; name: string };
type StockItem = { id: string; name: string; unit: string };

type PurchaseFormProps = {
  suppliers: Supplier[];
  stockItems: StockItem[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function PurchaseForm({
  suppliers,
  stockItems,
  onSuccess,
  onCancel,
}: PurchaseFormProps): React.ReactElement {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      date: new Date(),
      paymentMethod: "",
      notes: "",
      items: [{ stockItemId: "", quantity: "1", unitPrice: "0" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchedItems = form.watch("items");

  const total = useMemo(
    () =>
      watchedItems.reduce((acc, item) => {
        const qty = parseNumber(item.quantity);
        const price = parseNumber(item.unitPrice);
        return acc + qty * price;
      }, 0),
    [watchedItems]
  );

  async function onSubmit(data: FormValues): Promise<void> {
    const purchaseData: PurchaseFormData = {
      ...data,
      items: data.items.map((item) => ({
        stockItemId: item.stockItemId,
        quantity: parseNumber(item.quantity),
        unitPrice: item.unitPrice,
      })),
    };

    try {
      const result = await createPurchase(purchaseData);

      if (result.success) {
        toast.success("Compra registrada com sucesso!");
        form.reset();
        onSuccess?.();
      } else {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            form.setError(field as Path<FormValues>, {
              type: "server",
              message: errors[0],
            });
          }
        }
        toast.error(result.error || "Erro ao registrar compra");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao registrar compra");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {field.value
                          ? format(field.value, "PPP", { locale: ptBR })
                          : "Selecione a data"}
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
        </div>

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de Pagamento *</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Itens *</FormLabel>
            <Button
              onClick={() =>
                append({ stockItemId: "", quantity: "1", unitPrice: "0" })
              }
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 size-4" />
              Adicionar Item
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((fieldItem, index) => {
              const itemQty = parseNumber(watchedItems[index]?.quantity);
              const itemPrice = parseNumber(watchedItems[index]?.unitPrice);
              const subtotal = itemQty * itemPrice;

              return (
                <div
                  className="grid gap-3 rounded-lg border p-3 sm:grid-cols-12"
                  key={fieldItem.id}
                >
                  <div className="sm:col-span-5">
                    <FormField
                      control={form.control}
                      name={`items.${index}.stockItemId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Item</FormLabel>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stockItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} ({item.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Qtd</FormLabel>
                          <FormControl>
                            <Input
                              min="0"
                              step="0.01"
                              type="number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Valor (R$)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0.00"
                              type="text"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^\d.]/g,
                                  ""
                                );
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-end justify-between sm:col-span-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Subtotal: </span>
                      <span className="font-medium">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        onClick={() => remove(index)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {form.formState.errors.items?.root ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.items.root.message}
            </p>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre a compra (opcional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between border-t pt-4">
          <div className="font-semibold text-lg">
            Total: {formatPrice(total)}
          </div>
          <div className="flex gap-2">
            {onCancel ? (
              <Button onClick={onCancel} type="button" variant="outline">
                Cancelar
              </Button>
            ) : null}
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Registrar Compra
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
