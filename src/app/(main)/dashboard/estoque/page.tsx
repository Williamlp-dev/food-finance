import type { Metadata } from "next";
import { getStockItems } from "@/actions/stock/get-stock-items";
import { StockClient } from "./stock-client";

export const metadata: Metadata = {
  title: "Estoque",
};

export default async function StockPage(): Promise<React.ReactElement> {
  const result = await getStockItems();
  const items = result.success && result.data ? result.data : [];

  return <StockClient initialItems={items} />;
}
