"use client";

import {
  CreditCard,
  Database,
  FileText,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";
import type { User } from "@/lib/auth";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  user: User;
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Compras", href: "/dashboard/compras", icon: ShoppingCart },
  { name: "Estoque", href: "/dashboard/estoque", icon: Package },
  { name: "Fornecedores", href: "/dashboard/fornecedores", icon: Truck },
  { name: "Funcionários", href: "/dashboard/funcionarios", icon: Users },
  { name: "Pagamentos", href: "/dashboard/pagamentos", icon: CreditCard },
  { name: "Despesas", href: "/dashboard/despesas", icon: Receipt },
  { name: "Vendas", href: "/dashboard/vendas", icon: TrendingUp },
  { name: "Relatórios", href: "/dashboard/relatorios", icon: FileText },
  { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
  { name: "Backup", href: "/dashboard/backup", icon: Database },
];

export function DashboardSidebar({
  open,
  collapsed,
  onClose,
  user,
}: DashboardSidebarProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-200 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        aria-label="Sidebar navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 border-r bg-card transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "md:-translate-x-full" : "md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <span className="font-semibold text-lg tracking-tight">
              Dashboard
            </span>
            <Button
              aria-label="Close menu"
              className="md:hidden"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={onClose}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <UserDropdown user={user} />
          </div>
        </div>
      </aside>
    </>
  );
}
