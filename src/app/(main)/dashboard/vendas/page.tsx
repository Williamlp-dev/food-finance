import type { Metadata } from "next";
import { getSales } from "@/actions/sale/get-sales";
import { SaleClient } from "./sale-client";

export const metadata: Metadata = {
  title: "Vendas",
};

export default async function VendasPage(): Promise<React.ReactElement> {
  const result = await getSales();
  const sales = result.success ? result.data : [];

  return <SaleClient initialSales={sales} />;
}
