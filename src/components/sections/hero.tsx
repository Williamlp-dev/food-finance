"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export const Hero = () => (
  <Section className="relative overflow-hidden bg-dashed py-32 sm:py-48 md:py-64 lg:py-72">
    <motion.div
      animate={{ opacity: 1 }}
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1 }}
    >
      <div className="absolute right-0 bottom-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-3xl" />
    </motion.div>

    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex flex-col items-center justify-center gap-8 px-4 sm:px-16"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="flex flex-col gap-4">
        <h1 className="max-w-3xl text-center font-semibold text-4xl tracking-tight md:text-6xl lg:text-7xl">
          Controle Financeiro
          <br />
          Simples e Eficiente
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-center text-base text-muted-foreground leading-relaxed sm:text-lg md:text-xl">
          Gerencie suas vendas, compras e estoque em um único lugar. Tome
          decisões inteligentes com relatórios detalhados.
        </p>
      </div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Button asChild className="group gap-2" size="lg">
          <Link href="/sign-up">
            Começar Agora
            <ArrowUpRight className="size-4 transition-transform group-hover:-rotate-12" />
          </Link>
        </Button>
        <Button
          asChild
          className="group gap-2 bg-muted/70 shadow-none"
          size="lg"
          variant="outline"
        >
          <Link href="/sign-in">
            Fazer Login
            <ArrowUpRight className="size-4 transition-transform group-hover:-rotate-12" />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  </Section>
);
