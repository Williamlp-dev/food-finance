import type { Metadata } from "next";
import { getEmployees } from "@/actions/employees/get-employees";
import { getPayments } from "@/actions/payments/get-payments";
import { PaymentClient } from "./payment-client";

export const metadata: Metadata = {
  title: "Pagamentos",
};

export default async function PaymentPage(): Promise<React.ReactElement> {
  const [paymentsResult, employeesResult] = await Promise.all([
    getPayments(),
    getEmployees(),
  ]);

  const payments = paymentsResult.success ? paymentsResult.data : [];
  const employees = employeesResult.success ? employeesResult.data : [];

  return <PaymentClient employees={employees} initialPayments={payments} />;
}
