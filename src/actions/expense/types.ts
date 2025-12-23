import { z } from "zod";

export const expenseSchema = z.object({
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
  value: z.number().positive("Valor deve ser positivo"),
  date: z.date(),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
