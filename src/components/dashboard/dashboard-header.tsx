"use client";

import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

type DashboardHeaderProps = {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
  onToggleSidebar: () => void;
};

export function DashboardHeader({
  sidebarCollapsed,
  onMenuClick,
  onToggleSidebar,
}: DashboardHeaderProps): React.ReactElement {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <Button
          aria-label="Open menu"
          className="md:hidden"
          onClick={onMenuClick}
          size="icon"
          variant="ghost"
        >
          <Menu className="size-4" />
        </Button>

        <Button
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex"
          onClick={onToggleSidebar}
          size="icon"
          variant="ghost"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <ModeToggle />
      </div>
    </header>
  );
}
