import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
