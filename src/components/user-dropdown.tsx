"use client";

import { LogOutIcon, ShieldIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type UserDropdownProps = {
  user: User;
};

export function UserDropdown({ user }: UserDropdownProps): React.ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-auto w-full justify-start gap-3 px-3 py-2.5"
          variant="ghost"
        >
          {user.image ? (
            <Image
              alt={user.name}
              className="shrink-0 rounded-full object-cover ring-1 ring-border"
              height={32}
              src={user.image}
              width={32}
            />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
              <UserIcon className="size-4" />
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-medium text-sm">{user.name}</p>
            <p className="truncate text-muted-foreground text-xs">
              {user.email}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium text-sm">{user.name}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            className="flex items-center gap-2"
            href="/dashboard/profile"
            prefetch={true}
          >
            <UserIcon className="size-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && <AdminItem />}
        <DropdownMenuSeparator />
        <SignOutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminItem(): React.ReactElement {
  return (
    <DropdownMenuItem asChild>
      <Link
        className="flex items-center gap-2"
        href="/dashboard/admin"
        prefetch={true}
      >
        <ShieldIcon className="size-4" />
        <span>Admin</span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutItem(): React.ReactElement {
  const router = useRouter();

  async function handleSignOut(): Promise<void> {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.message || "Algo deu errado");
    } else {
      toast.success("Você saiu com sucesso!");
      router.push("/sign-in");
    }
  }

  return (
    <DropdownMenuItem
      className="flex items-center gap-2 text-destructive focus:text-destructive"
      onClick={handleSignOut}
    >
      <LogOutIcon className="size-4" />
      <span>Sair</span>
    </DropdownMenuItem>
  );
}
