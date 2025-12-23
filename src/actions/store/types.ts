import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(1, "Nome da loja é obrigatório"),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type StoreFormData = z.infer<typeof storeSchema>;
