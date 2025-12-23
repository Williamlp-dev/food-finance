import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().min(1, "Função é obrigatória"),
  baseSalary: z.coerce.number().min(0, "Salário deve ser positivo").default(0),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export type Employee = {
  id: string;
  name: string;
  cpf: string | null;
  phone: string | null;
  role: string;
  baseSalary: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
