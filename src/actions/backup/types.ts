export type BackupSummary = {
  suppliers: number;
  purchases: number;
  stockItems: number;
  employees: number;
  payments: number;
  expenses: number;
  sales: number;
};

export type BackupData = {
  version: string;
  exportedAt: string;
  userId: string;
  data: {
    suppliers: unknown[];
    purchases: unknown[];
    stockItems: unknown[];
    employees: unknown[];
    payments: unknown[];
    expenseCategories: unknown[];
    expenses: unknown[];
    sales: unknown[];
    store: unknown | null;
  };
};
