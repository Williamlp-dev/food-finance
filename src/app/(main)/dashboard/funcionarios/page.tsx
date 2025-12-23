import type { Metadata } from "next";
import { getEmployees } from "@/actions/employees/get-employees";
import { EmployeesList } from "./employee-list";

export const metadata: Metadata = {
  title: "Funcionários",
};

export default async function FuncionariosPage() {
  const result = await getEmployees();
  const employees = result.success ? result.data : null;
  const error = result.success ? undefined : result.error;

  return <EmployeesList employees={employees} error={error} />;
}
