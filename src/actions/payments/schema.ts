import { z } from "zod";

export const createPaymentSchema = z.object({
  employeeId: z.string().min(1, "Selecione um funcionário"),
  date: z.date(),
  description: z.string().optional(),
  grossValue: z.number().min(0, "Valor bruto deve ser maior ou igual a 0"),
  discounts: z.number().min(0, "Descontos devem ser maior ou igual a 0"),
});

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;
