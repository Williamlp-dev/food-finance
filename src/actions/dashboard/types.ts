export type DashboardMetrics = {
  salesMonth: number;
  purchasesMonth: number;
  expensesMonth: number;
  estimatedProfit: number;
};

export type ChartDataPoint = {
  date: string;
  sales: number;
  expenses: number;
};

export type LowStockItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};
