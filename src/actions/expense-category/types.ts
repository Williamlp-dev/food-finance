import { z } from "zod";

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
});

export type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>;
