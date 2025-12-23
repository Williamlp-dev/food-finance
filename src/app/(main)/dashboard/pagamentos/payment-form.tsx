"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { Employee } from "@/actions/employees/types";
import { createPayment } from "@/actions/payments/create-payment";
import {
  type CreatePaymentSchema,
  createPaymentSchema,
} from "@/actions/payments/schema";
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
import { cn } from "@/lib/utils";

type PaymentFormProps = {
  employees: Employee[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function PaymentForm({
  employees,
  onSuccess,
  onCancel,
}: PaymentFormProps): React.ReactElement {
  const form = useForm<CreatePaymentSchema>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      employeeId: "",
      description: "",
      grossValue: 0,
      discounts: 0,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const grossValue = useWatch({ control: form.control, name: "grossValue" });
  const discounts = useWatch({ control: form.control, name: "discounts" });
  const netValue = (Number(grossValue) || 0) - (Number(discounts) || 0);

  async function onSubmit(data: CreatePaymentSchema): Promise<void> {
    try {
      const result = await createPayment(data);

      if (result.success) {
        toast.success("Pagamento registrado com sucesso!");
        form.reset();
        onSuccess?.();
      } else {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof CreatePaymentSchema, {
              type: "server",
              message: errors[0],
            });
          }
        }
        toast.error(result.error || "Erro ao registrar pagamento");
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
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funcionário</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
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
            <FormItem className="flex flex-col">
              <FormLabel>Data do Pagamento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      variant={"outline"}
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição / Período</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Salário Janeiro/2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="grossValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Bruto</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discounts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descontos</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-md bg-muted p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Valor Líquido:</span>
            <span className="font-bold text-lg">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(netValue)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onCancel ? (
            <Button onClick={onCancel} type="button" variant="outline">
              Cancelar
            </Button>
          ) : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Salvar Pagamento
          </Button>
        </div>
      </form>
    </Form>
  );
}
