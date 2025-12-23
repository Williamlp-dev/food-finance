import type { Metadata } from "next";
import { getMonthlySummary } from "@/actions/reports/get-monthly-summary";
import { ReportsClient } from "./reports-client";

export const metadata: Metadata = {
  title: "Relatórios",
};

type PageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function RelatoriosPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const now = new Date();
  const year = params.year
    ? Number.parseInt(params.year, 10)
    : now.getFullYear();
  const month = params.month
    ? Number.parseInt(params.month, 10)
    : now.getMonth();

  const result = await getMonthlySummary(year, month);
  const summary = result.success
    ? result.data
    : {
        sales: "0.00",
        purchases: "0.00",
        expenses: "0.00",
        balance: "0.00",
        profit: "0.00",
      };

  return (
    <ReportsClient
      initialMonth={month}
      initialSummary={summary}
      initialYear={year}
    />
  );
}
