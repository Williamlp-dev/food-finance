"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createSupplier } from "@/actions/supplier/create-supplier";
import type { SupplierFormData } from "@/actions/supplier/types";
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

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
});

type SupplierFormProps = {
  onSuccess?: (supplierId: string) => void;
  onCancel?: () => void;
};

export function SupplierForm({
  onSuccess,
  onCancel,
}: SupplierFormProps): React.ReactElement {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: SupplierFormData): Promise<void> {
    try {
      const result = await createSupplier(data);

      if (result.success && result.data?.supplierId) {
        toast.success("Fornecedor criado com sucesso!");
        form.reset();
        onSuccess?.(result.data.supplierId);
      } else if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            const errorMessages = errors as string[];
            form.setError(field as keyof SupplierFormData, {
              type: "server",
              message: errorMessages[0],
            });
          }
        }
        toast.error(result.error || "Erro ao criar fornecedor");
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
                <Input placeholder="Nome do fornecedor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="email@exemplo.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            Salvar Fornecedor
          </Button>
        </div>
      </form>
    </Form>
  );
}
