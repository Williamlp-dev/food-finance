import { z } from "zod";

export const stockItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unidade é obrigatória"),
  quantity: z.coerce.number().min(0, "Quantidade inválida"),
  unitCost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Formato de preço inválido (ex: 10.99)"),
});

export type StockItemFormData = z.infer<typeof stockItemSchema>;
