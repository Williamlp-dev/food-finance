"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/ui/section";

export const Footer = () => (
  <Section className="bg-background py-12">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:text-left">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg tracking-tight">Food Finance</h3>
        <p className="max-w-sm text-muted-foreground text-sm">
          Um projeto pessoal desenvolvido para facilitar a gestão financeira de
          pequenos negócios.
          <br />
          100% gratuito, funcional e open source.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          className="text-muted-foreground transition-colors hover:text-foreground"
          href="https://github.com"
          target="_blank"
        >
          <Github className="size-5" />
          <span className="sr-only">GitHub</span>
        </Link>
      </div>
    </div>
    <div className="mt-12 text-center text-muted-foreground text-xs">
      <p>
        © {new Date().getFullYear()} Food Finance. Todos os direitos reservados.
      </p>
    </div>
  </Section>
);
