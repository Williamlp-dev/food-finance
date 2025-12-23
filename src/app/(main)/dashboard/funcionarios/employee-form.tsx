"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEmployee } from "@/actions/employees/create-employee";
import type { Employee, EmployeeFormData } from "@/actions/employees/types";
import { updateEmployee } from "@/actions/employees/update-employee";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { parseNumber } from "@/lib/utils";

type EmployeeFormValues = {
  name: string;
  cpf: string;
  phone: string;
  role: string;
  baseSalary: string;
};

type EmployeeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: Employee;
};

export function EmployeeForm({
  open,
  onOpenChange,
  employeeToEdit,
}: EmployeeFormProps) {
  const router = useRouter();
  const form = useForm<EmployeeFormValues>({
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      role: "",
      baseSalary: "0",
    },
  });

  useEffect(() => {
    if (employeeToEdit) {
      form.reset({
        name: employeeToEdit.name,
        cpf: employeeToEdit.cpf ?? "",
        phone: employeeToEdit.phone ?? "",
        role: employeeToEdit.role,
        baseSalary: String(employeeToEdit.baseSalary),
      });
    } else {
      form.reset({
        name: "",
        cpf: "",
        phone: "",
        role: "",
        baseSalary: "0",
      });
    }
  }, [employeeToEdit, form]);

  const onSubmit = async (values: EmployeeFormValues) => {
    console.log(
      "[CLIENT DEBUG] values.baseSalary:",
      values.baseSalary,
      "type:",
      typeof values.baseSalary
    );
    const parsedSalary = parseNumber(values.baseSalary);
    console.log(
      "[CLIENT DEBUG] parsedSalary:",
      parsedSalary,
      "type:",
      typeof parsedSalary
    );

    const data: EmployeeFormData = {
      name: values.name,
      cpf: values.cpf,
      phone: values.phone,
      role: values.role,
      baseSalary: parsedSalary,
    };

    console.log("[CLIENT DEBUG] data to send:", JSON.stringify(data));

    try {
      const action = employeeToEdit
        ? (d: EmployeeFormData) => updateEmployee(employeeToEdit.id, d)
        : createEmployee;

      const result = await action(data);

      if (result.success) {
        toast.success(
          employeeToEdit
            ? "Funcionário atualizado com sucesso!"
            : "Funcionário criado com sucesso!"
        );
        onOpenChange(false);
        if (!employeeToEdit) {
          form.reset();
        }
        router.refresh();
      } else {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof EmployeeFormData, {
              type: "server",
              message: errors[0],
            });
          }
        }
        toast.error(result.error || "Ocorreu um erro ao salvar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao salvar funcionário");
    }
  };

  const getSubmitLabel = () => {
    if (form.formState.isSubmitting) {
      return "Salvando...";
    }
    return employeeToEdit ? "Salvar Alterações" : "Criar Funcionário";
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {employeeToEdit ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
          <DialogDescription>
            {employeeToEdit
              ? "Edite as informações do funcionário abaixo."
              : "Preencha as informações para adicionar um novo funcionário."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do funcionário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função *</FormLabel>
                    <FormControl>
                      <Input placeholder="Cargo / Função" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário Base</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {getSubmitLabel()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
