import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      {token ? (
        <ResetPasswordUI token={token} />
      ) : (
        <div className="text-red-600" role="alert">
          Token não encontrado.
        </div>
      )}
    </main>
  );
}

type ResetPasswordUIProps = {
  token: string;
};

function ResetPasswordUI({ token }: ResetPasswordUIProps) {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl">Redefinir senha</h1>
        <p className="text-muted-foreground">Digite sua nova senha abaixo.</p>
      </div>
      <ResetPasswordForm token={token} />
      <div className="flex justify-center">
        <Button asChild className="w-full max-w-md" variant="ghost">
          <Link href="/sign-in">
            <ArrowLeft className="mr-2 size-4" />
            Voltar para o login
          </Link>
        </Button>
      </div>
    </div>
  );
}
