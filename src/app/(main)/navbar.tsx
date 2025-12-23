import Image from "next/image";
import Link from "next/link";
import codingInFlowLogo from "@/assets/coding_in_flow_logo.jpg";
import { ModeToggle } from "@/components/dashboard/mode-toggle";
import { UserDropdown } from "@/components/user-dropdown";
import { getServerSession } from "@/lib/get-session";

export async function Navbar(): Promise<React.ReactElement | null> {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          className="flex items-center gap-2.5 font-medium text-sm transition-colors hover:text-foreground/80"
          href="/dashboard"
        >
          <Image
            alt="Coding in Flow logo"
            className="rounded-full ring-1 ring-border"
            height={28}
            src={codingInFlowLogo}
            width={28}
          />
          <span className="hidden sm:inline">Food Finance</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ModeToggle />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
