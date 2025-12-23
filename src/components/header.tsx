"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import Link from "next/link";
import React from "react";
import { MenuToggleIcon } from "@/components/menu-toggle-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Cross } from "@/components/ui/section";

import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = React.useState(false);

  const links = [
    {
      label: "Contato",
      href: "#contato",
    },
  ];

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const mobileMenuVariants: Variants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.05,
      },
    },
  };

  const mobileItemVariants: Variants = {
    closed: { opacity: 0, y: 10 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-border border-b border-dashed bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/50"
      )}
    >
      <nav className="container relative z-50 mx-auto flex h-14 w-full items-center justify-between border-border border-dashed px-4 sm:border-x">
        <Link
          className="font-semibold text-xl tracking-tight transition-colors hover:text-primary"
          href="/"
        >
          Food Finance
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              className={buttonVariants({ variant: "ghost" })}
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Começar</Link>
            </Button>
          </div>
        </div>
        <Button
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          size="icon"
          variant="outline"
        >
          <MenuToggleIcon className="size-5" duration={300} open={open} />
        </Button>
        <div className="absolute -bottom-3 -left-3 z-10 hidden h-6 sm:block">
          <Cross />
        </div>
        <div className="absolute -right-3 -bottom-3 z-10 hidden h-6 -translate-x-px sm:block">
          <Cross />
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => {
                setOpen(false);
              }}
            />
            <motion.div
              animate="open"
              className="fixed top-16 right-4 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:hidden"
              exit="closed"
              initial="closed"
              variants={mobileMenuVariants}
            >
              <div className="space-y-6 p-6">
                <div className="space-y-1">
                  {links.map((link) => (
                    <motion.div key={link.label} variants={mobileItemVariants}>
                      <Link
                        className="block rounded-lg px-4 py-3 font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                        href={link.href}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="space-y-3 border-border border-t pt-6"
                  variants={mobileItemVariants}
                >
                  <Link
                    className="block w-full rounded-lg py-3 text-center font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    className="block w-full rounded-lg bg-primary py-3 text-center font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90"
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                  >
                    Começar
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
