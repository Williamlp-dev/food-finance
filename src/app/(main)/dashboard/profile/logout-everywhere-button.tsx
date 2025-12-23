"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/loading-button";
import { authClient } from "@/lib/auth-client";

export function LogoutEverywhereButton(): React.ReactElement {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogoutEverywhere(): Promise<void> {
    setLoading(true);
    const { error } = await authClient.revokeSessions();
    setLoading(false);

    if (error) {
      toast.error(error.message || "Erro ao sair de todos os dispositivos");
    } else {
      toast.success("Desconectado de todos os dispositivos com sucesso!");
      router.push("/sign-in");
    }
  }

  return (
    <LoadingButton
      className="w-full"
      loading={loading}
      onClick={handleLogoutEverywhere}
      variant="destructive"
    >
      Sair de todos os dispositivos
    </LoadingButton>
  );
}
