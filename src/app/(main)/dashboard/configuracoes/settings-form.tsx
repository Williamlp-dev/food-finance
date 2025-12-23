"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateStore } from "@/actions/store/update-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Store = {
  id: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type SettingsFormProps = {
  initialData: Store | null;
};

export function SettingsForm({
  initialData,
}: SettingsFormProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const data = {
      name: formData.get("name") as string,
      cnpj: formData.get("cnpj") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    };

    const result = await updateStore(data);

    if (result.success) {
      toast.success("Dados salvos com sucesso!");
    } else {
      toast.error(result.error || "Erro ao salvar dados");
    }

    setIsLoading(false);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome da Loja <span className="text-destructive">*</span>
          </Label>
          <Input
            defaultValue={initialData?.name || ""}
            disabled={isLoading}
            id="name"
            name="name"
            placeholder="Digite o nome da loja"
            required
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            defaultValue={initialData?.cnpj || ""}
            disabled={isLoading}
            id="cnpj"
            name="cnpj"
            placeholder="00.000.000/0000-00"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            defaultValue={initialData?.phone || ""}
            disabled={isLoading}
            id="phone"
            name="phone"
            placeholder="(00) 00000-0000"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Textarea
            className="min-h-[100px] resize-none"
            defaultValue={initialData?.address || ""}
            disabled={isLoading}
            id="address"
            name="address"
            placeholder="Rua, número, complemento, bairro, cidade - UF"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </form>
  );
}
