"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createStockItem } from "@/actions/stock/create-stock-item";
import type { StockItemFormData } from "@/actions/stock/types";
import { updateStockItem } from "@/actions/stock/update-stock-item";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, parseNumber } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unidade é obrigatória"),
  quantity: z.string(),
  unitCost: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const units = [
  { value: "un", label: "Unidade (un)" },
  { value: "kg", label: "Quilograma (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "l", label: "Litro (l)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "cx", label: "Caixa (cx)" },
  { value: "pc", label: "Pacote (pc)" },
  { value: "fd", label: "Fardo (fd)" },
  { value: "dz", label: "Dúzia (dz)" },
];

type StockItem = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  quantity: number;
  unitCost: string;
  totalValue: string;
};

type StockItemFormProps = {
  item?: StockItem;
  onSuccess?: (itemId?: string) => void;
  onCancel?: () => void;
};

export function StockItemForm({
  item,
  onSuccess,
  onCancel,
}: StockItemFormProps): React.ReactElement {
  const isEditing = !!item;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name ?? "",
      description: item?.description ?? "",
      unit: item?.unit ?? "un",
      quantity: item ? String(item.quantity) : "0",
      unitCost: item ? String(item.unitCost) : "0",
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description ?? "",
        unit: item.unit,
        quantity: String(item.quantity),
        unitCost: String(item.unitCost),
      });
    } else {
      form.reset({
        name: "",
        description: "",
        unit: "un",
        quantity: "0",
        unitCost: "0",
      });
    }
  }, [item, form]);

  const isSubmitting = form.formState.isSubmitting;
  const watchedQty = form.watch("quantity");
  const watchedUnitCost = form.watch("unitCost");

  const qtyValue = parseNumber(watchedQty);
  // Parse for display calculation only
  const costValue = Number(watchedUnitCost) || 0;
  const totalValue = qtyValue * costValue;

  async function onSubmit(data: FormValues): Promise<void> {
    const qty = parseNumber(data.quantity);
    // unitCost is already a string validated by regex

    const formData: StockItemFormData = {
      name: data.name,
      description: data.description,
      unit: data.unit,
      quantity: qty,
      unitCost: data.unitCost, // Pass string directly
    };

    try {
      const action =
        isEditing && item
          ? (d: StockItemFormData) => updateStockItem(item.id, d)
          : createStockItem;

      const result = await action(formData);

      if (result.success) {
        toast.success(
          isEditing
            ? "Item atualizado com sucesso!"
            : "Item criado com sucesso!"
        );
        if (!isEditing) {
          form.reset();
        }
        // Properly handle the optional generic return type which might be void or { itemId: string }
        // We cast to any safe access because we know create returns object and update returns void/undefined in data
        const returnData = result.data as { itemId?: string } | undefined;
        onSuccess?.(returnData?.itemId);
      } else {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            // Mapping keys: generic StockItemFormData keys roughly match form keys.
            // TS check: field is keyof StockItemFormData.
            // We need to match it to keyof FormValues.
            // 'quantity' and 'unitCost' are strings in FormValues, match perfectly name-wise.
            if (field in formSchema.shape) {
              form.setError(field as keyof FormValues, {
                type: "server",
                message: errors[0],
              });
            }
          }
        }
        toast.error(result.error || "Erro ao salvar item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do item" {...field} />
              </FormControl>
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
                <Input placeholder="Descrição (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input
                    inputMode="decimal"
                    min="0"
                    placeholder="0"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo Unit. (R$)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="decimal"
                    placeholder="0.00"
                    type="text"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d.]/g, "");
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-md border p-3 text-sm">
          <span className="text-muted-foreground">Valor Total: </span>
          <span className="font-semibold">{formatPrice(totalValue)}</span>
        </div>

        <div className="flex gap-2 pt-2">
          {onCancel ? (
            <Button onClick={onCancel} type="button" variant="outline">
              Cancelar
            </Button>
          ) : null}
          <Button className="flex-1" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {isEditing ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
