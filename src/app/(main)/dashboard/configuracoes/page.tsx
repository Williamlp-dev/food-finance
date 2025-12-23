import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { getStore } from "@/actions/store/get-store";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function ConfiguracoesPage(): Promise<React.ReactElement> {
  const storeResult = await getStore();
  const store = storeResult.success ? storeResult.data : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-semibold text-xl tracking-tight sm:text-2xl">
          <Settings className="size-5 text-muted-foreground" />
          Configurações
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Configure os dados da sua loja.
        </p>
      </header>

      <div className="rounded-lg border p-6">
        <SettingsForm initialData={store} />
      </div>
    </div>
  );
}
