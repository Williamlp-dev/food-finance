import { z } from "zod";

export const saleSchema = z.object({
  date: z.date(),
  totalValue: z.number().positive("Valor total deve ser positivo"),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  notes: z.string().optional(),
});

export type SaleFormData = z.infer<typeof saleSchema>;
