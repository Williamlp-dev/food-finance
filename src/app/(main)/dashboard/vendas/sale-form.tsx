"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createSale } from "@/actions/sale/create-sale";
import { updateSale } from "@/actions/sale/update-sale";
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

type Sale = {
  id: string;
  date: Date;
  totalValue: string;
  paymentMethod: string;
  notes: string | null;
};

type SaleFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Sale;
};

const formSchema = z.object({
  date: z.date(),
  totalValue: z.string().min(1, "Valor total é obrigatório"),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const paymentMethods = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
  { value: "misto", label: "Misto" },
];

export function SaleForm({
  onSuccess,
  onCancel,
  initialData,
}: SaleFormProps): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      totalValue: "",
      paymentMethod: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        date: new Date(initialData.date),
        totalValue: initialData.totalValue,
        paymentMethod: initialData.paymentMethod,
        notes: initialData.notes || "",
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: FormData): Promise<void> {
    setIsSubmitting(true);

    const saleData = {
      date: data.date,
      totalValue: Number.parseFloat(data.totalValue),
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    };

    const result = isEditing
      ? await updateSale(initialData.id, saleData)
      : await createSale(saleData);

    if (result.success) {
      toast.success(
        isEditing
          ? "Venda atualizada com sucesso!"
          : "Venda criada com sucesso!"
      );
      onSuccess();
    } else {
      toast.error(result.error || "Erro ao salvar venda");
    }

    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
          name="totalValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total *</FormLabel>
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre a venda (opcional)"
                  {...field}
                />
              </FormControl>
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
              return isEditing ? "Salvar" : "Criar Venda";
            })()}
          </Button>
        </div>
      </form>
    </Form>
  );
}
