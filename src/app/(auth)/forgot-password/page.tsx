import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="font-semibold text-2xl">Esqueci minha senha</h1>
          <p className="text-muted-foreground">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>
        </div>
        <ForgotPasswordForm />
        <div className="flex justify-center">
          <Button asChild className="w-full max-w-md" variant="ghost">
            <Link href="/sign-in">
              <ArrowLeft className="mr-2 size-4" />
              Voltar para o login
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
