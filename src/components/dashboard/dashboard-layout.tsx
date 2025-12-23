"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
  user: User;
};

export function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen max-w-full bg-background">
      <DashboardSidebar
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
        user={user}
      />

      <div
        className={cn(
          "flex max-w-full flex-1 flex-col transition-all duration-300",
          !collapsed && "md:ml-56"
        )}
      >
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
          sidebarCollapsed={collapsed}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
