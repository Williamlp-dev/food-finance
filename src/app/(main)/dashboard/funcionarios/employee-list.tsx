"use client";

import { Edit, Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteEmployee } from "@/actions/employees/delete-employee";
import type { Employee } from "@/actions/employees/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeForm } from "./employee-form";

type EmployeesListProps = {
  employees: Employee[] | null | undefined;
  error?: string;
};

export function EmployeesList({ employees, error }: EmployeesListProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(
    undefined
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      const result = await deleteEmployee(deleteId);
      if (result.success) {
        toast.success("Funcionário excluído com sucesso");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir funcionário");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <header>
          <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
            <Users className="size-5 text-muted-foreground" />
            Funcionários
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Gerencie sua equipe e colaboradores.
          </p>
        </header>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          Novo Funcionário
        </Button>
      </div>

      {error || !employees ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p>Erro ao carregar funcionários: {error || "Erro desconhecido"}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Salário Base</TableHead>
                <TableHead className="w-[100px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="text-center text-muted-foreground"
                    colSpan={6}
                  >
                    Nenhum funcionário cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell>{employee.cpf || "-"}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(employee.baseSalary)}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button
                        onClick={() => handleEdit(employee)}
                        size="icon"
                        variant="ghost"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(employee.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <EmployeeForm
        employeeToEdit={editingEmployee}
        onOpenChange={setIsFormOpen}
        open={isFormOpen}
      />

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteId(null)}
        open={!!deleteId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              funcionário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
