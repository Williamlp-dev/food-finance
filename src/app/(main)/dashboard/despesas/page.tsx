import type { Metadata } from "next";
import { getExpenses } from "@/actions/expense/get-expenses";
import { getExpenseCategories } from "@/actions/expense-category/get-expense-categories";
import { ExpenseClient } from "./expense-client";

export const metadata: Metadata = {
  title: "Despesas",
};

export default async function DespesasPage(): Promise<React.ReactElement> {
  const [expensesResult, categoriesResult] = await Promise.all([
    getExpenses(),
    getExpenseCategories(),
  ]);

  const expenses = expensesResult.success ? expensesResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return <ExpenseClient categories={categories} initialExpenses={expenses} />;
}
