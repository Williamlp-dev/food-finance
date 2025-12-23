"use client";

import {
  BarChart3,
  Download,
  FileDown,
  FileSpreadsheet,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportExpensesCSV } from "@/actions/reports/export-expenses-csv";
import { exportSalesCSV } from "@/actions/reports/export-sales-csv";
import { exportStockCSV } from "@/actions/reports/export-stock-csv";
import { exportSuppliersCSV } from "@/actions/reports/export-suppliers-csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

type Summary = {
  sales: string;
  purchases: string;
  expenses: string;
  balance: string;
  profit: string;
};

type ReportsClientProps = {
  initialSummary: Summary;
  initialYear: number;
  initialMonth: number;
};

const months = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ReportsClient({
  initialSummary,
  initialYear,
  initialMonth,
}: ReportsClientProps): React.ReactElement {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  async function handleExportSales() {
    setIsExporting("sales");
    try {
      const csv = await exportSalesCSV(initialYear, initialMonth);
      downloadCSV(
        csv,
        `vendas-${months[initialMonth].label}-${initialYear}.csv`
      );
      toast.success("Vendas exportadas com sucesso!");
    } catch {
      toast.error("Erro ao exportar vendas");
    }
    setIsExporting(null);
  }

  async function handleExportExpenses() {
    setIsExporting("expenses");
    try {
      const csv = await exportExpensesCSV(initialYear, initialMonth);
      downloadCSV(
        csv,
        `despesas-${months[initialMonth].label}-${initialYear}.csv`
      );
      toast.success("Despesas exportadas com sucesso!");
    } catch {
      toast.error("Erro ao exportar despesas");
    }
    setIsExporting(null);
  }

  async function handleExportStock() {
    setIsExporting("stock");
    try {
      const csv = await exportStockCSV();
      downloadCSV(csv, `estoque-${new Date().toISOString().split("T")[0]}.csv`);
      toast.success("Estoque exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar estoque");
    }
    setIsExporting(null);
  }

  async function handleExportSuppliers() {
    setIsExporting("suppliers");
    try {
      const csv = await exportSuppliersCSV();
      downloadCSV(
        csv,
        `fornecedores-${new Date().toISOString().split("T")[0]}.csv`
      );
      toast.success("Fornecedores exportados com sucesso!");
    } catch {
      toast.error("Erro ao exportar fornecedores");
    }
    setIsExporting(null);
  }

  function handlePeriodChange(type: "month" | "year", value: string) {
    const newMonth =
      type === "month" ? Number.parseInt(value, 10) : initialMonth;
    const newYear = type === "year" ? Number.parseInt(value, 10) : initialYear;
    window.location.href = `/dashboard/relatorios?year=${newYear}&month=${newMonth}`;
  }

  return (
    <div className="max-w-full space-y-6">
      <header className="max-w-full">
        <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
          <BarChart3 className="size-5 shrink-0 text-muted-foreground" />
          <span className="truncate">Relatórios</span>
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Visualize e exporte seus dados financeiros.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Selecionar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-muted-foreground text-xs"
                htmlFor="month-select"
              >
                Mês
              </label>
              <Select
                defaultValue={initialMonth.toString()}
                onValueChange={(value) => handlePeriodChange("month", value)}
              >
                <SelectTrigger id="month-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="mb-2 block text-muted-foreground text-xs"
                htmlFor="year-select"
              >
                Ano
              </label>
              <Select
                defaultValue={initialYear.toString()}
                onValueChange={(value) => handlePeriodChange("year", value)}
              >
                <SelectTrigger id="year-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 font-semibold text-base">
          Resumo de {months[initialMonth].label} {initialYear}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs">
                <TrendingUp className="size-4 text-green-500" />
                Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="truncate font-bold text-xl">
                {formatPrice(Number(initialSummary.sales))}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs">
                <ShoppingCart className="size-4 text-orange-500" />
                Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="truncate font-bold text-xl">
                {formatPrice(Number(initialSummary.purchases))}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs">
                <Receipt className="size-4 text-red-500" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="truncate font-bold text-xl">
                {formatPrice(Number(initialSummary.expenses))}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs">
                <BarChart3 className="size-4 text-blue-500" />
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="truncate font-bold text-xl">
                {formatPrice(Number(initialSummary.balance))}
              </p>
            </CardContent>
          </Card>

          <Card
            className={
              Number(initialSummary.profit) >= 0
                ? "border-green-500/20 bg-green-500/5"
                : "border-red-500/20 bg-red-500/5"
            }
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs">
                <TrendingUp
                  className={`size-4 ${
                    Number(initialSummary.profit) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
                Lucro Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="truncate font-bold text-xl">
                {formatPrice(Number(initialSummary.profit))}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-semibold text-base">Exportações</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="size-4 shrink-0" />
                <span className="truncate">Exportar Vendas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={isExporting === "sales"}
                onClick={handleExportSales}
                size="sm"
                variant="outline"
              >
                <Download className="mr-2 size-4" />
                {isExporting === "sales" ? "Exportando..." : "Exportar CSV"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Receipt className="size-4 shrink-0" />
                <span className="truncate">Exportar Despesas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={isExporting === "expenses"}
                onClick={handleExportExpenses}
                size="sm"
                variant="outline"
              >
                <Download className="mr-2 size-4" />
                {isExporting === "expenses" ? "Exportando..." : "Exportar CSV"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package className="size-4 shrink-0" />
                <span className="truncate">Exportar Estoque</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={isExporting === "stock"}
                onClick={handleExportStock}
                size="sm"
                variant="outline"
              >
                <FileSpreadsheet className="mr-2 size-4" />
                {isExporting === "stock" ? "Exportando..." : "Exportar CSV"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Truck className="size-4 shrink-0" />
                <span className="truncate">Exportar Fornecedores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={isExporting === "suppliers"}
                onClick={handleExportSuppliers}
                size="sm"
                variant="outline"
              >
                <FileDown className="mr-2 size-4" />
                {isExporting === "suppliers" ? "Exportando..." : "Exportar CSV"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
