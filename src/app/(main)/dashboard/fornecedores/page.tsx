import type { Metadata } from "next";
import { getSuppliers } from "@/actions/supplier/get-suppliers";
import { SupplierClient } from "./supplier-client";

export const metadata: Metadata = {
  title: "Fornecedores",
};

export default async function SupplierPage(): Promise<React.ReactElement> {
  const suppliersResult = await getSuppliers();
  const suppliers = suppliersResult.success ? suppliersResult.data : [];

  return <SupplierClient initialSuppliers={suppliers} />;
}
