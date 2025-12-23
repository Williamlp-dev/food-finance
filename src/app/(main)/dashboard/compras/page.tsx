import type { Metadata } from "next";
import { getPurchases } from "@/actions/purchase/get-purchases";
import { getStockItems } from "@/actions/stock/get-stock-items";
import { getSuppliers } from "@/actions/supplier/get-suppliers";
import { PurchaseClient } from "./purchase-client";
export const metadata: Metadata = {
  title: "Compras",
};

export default async function ComprasPage(): Promise<React.ReactElement> {
  const [purchasesResult, suppliersResult, stockItemsResult] =
    await Promise.all([getPurchases(), getSuppliers(), getStockItems()]);

  const purchases = purchasesResult.success ? purchasesResult.data : [];
  const suppliers = suppliersResult.success ? suppliersResult.data : [];
  const stockItems = stockItemsResult.success ? stockItemsResult.data : [];

  return (
    <PurchaseClient
      initialPurchases={purchases}
      stockItems={stockItems.map((i) => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
      }))}
      suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
