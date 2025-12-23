"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { MenuToggleIcon } from "@/components/menu-toggle-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cross } from "@/components/ui/section";

import { cn } from "@/lib/utils";

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: NavLink[] = [
  {
    label: "Contato",
    href: "#contato",
  },
];

const MOBILE_MENU_VARIANTS: Variants = {
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

const MOBILE_ITEM_VARIANTS: Variants = {
  closed: { opacity: 0, y: 10 },
  open: { opacity: 1, y: 0 },
};

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-28">
        <DropdownMenuItem className="text-sm" onClick={() => setTheme("light")}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm" onClick={() => setTheme("dark")}>
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sm"
          onClick={() => setTheme("system")}
        >
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopNav() {
  return (
    <div className="hidden items-center gap-2 md:flex">
      {NAV_LINKS.map((link) => (
        <Link
          className={buttonVariants({ variant: "ghost" })}
          href={link.href}
          key={link.label}
        >
          {link.label}
        </Link>
      ))}
      <div className="ml-2 flex items-center gap-2">
        <ThemeToggle />
        <Button asChild variant="outline">
          <Link href="/sign-in">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Começar</Link>
        </Button>
      </div>
    </div>
  );
}

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { setTheme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md md:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            animate="open"
            className="fixed top-16 right-4 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:hidden"
            exit="closed"
            initial="closed"
            variants={MOBILE_MENU_VARIANTS}
          >
            <div className="space-y-6 p-6">
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <motion.div key={link.label} variants={MOBILE_ITEM_VARIANTS}>
                    <Link
                      className="block rounded-lg px-4 py-3 font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                      href={link.href}
                      onClick={onClose}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="space-y-3 border-border border-t pt-6"
                variants={MOBILE_ITEM_VARIANTS}
              >
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="font-medium text-sm">Tema</span>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setTheme("light")}
                      size="sm"
                      variant="ghost"
                    >
                      <Sun className="size-4" />
                    </Button>
                    <Button
                      onClick={() => setTheme("dark")}
                      size="sm"
                      variant="ghost"
                    >
                      <Moon className="size-4" />
                    </Button>
                  </div>
                </div>
                <Link
                  className="block w-full rounded-lg py-3 text-center font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                  href="/sign-in"
                  onClick={onClose}
                >
                  Login
                </Link>
                <Link
                  className="block w-full rounded-lg bg-primary py-3 text-center font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90"
                  href="/sign-up"
                  onClick={onClose}
                >
                  Começar
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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

        <DesktopNav />

        <Button
          aria-controls="mobile-menu"
          aria-expanded={isMobileMenuOpen}
          aria-label="Alternar menu"
          className="md:hidden"
          onClick={toggleMobileMenu}
          size="icon"
          variant="outline"
        >
          <MenuToggleIcon
            className="size-5"
            duration={300}
            open={isMobileMenuOpen}
          />
        </Button>

        <div className="absolute -bottom-3 -left-3 z-10 hidden h-6 sm:block">
          <Cross />
        </div>
        <div className="absolute -right-3 -bottom-3 z-10 hidden h-6 -translate-x-px sm:block">
          <Cross />
        </div>
      </nav>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </header>
  );
}
