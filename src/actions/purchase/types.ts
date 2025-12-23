import { z } from "zod";

export const purchaseItemSchema = z.object({
  stockItemId: z.string().min(1, "Item é obrigatório"),
  quantity: z.number().min(0.01, "Quantidade deve ser maior que 0"),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Formato de preço inválido"),
});

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Fornecedor é obrigatório"),
  date: z.date(),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "Adicione pelo menos um item"),
});

export type PurchaseItemFormData = z.infer<typeof purchaseItemSchema>;
export type PurchaseFormData = z.infer<typeof purchaseSchema>;
