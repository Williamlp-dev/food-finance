"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const pathname = usePathname();

  return (
    <main className="flex grow items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-semibold text-2xl">401 - Unauthorized</h1>
          <p className="text-muted-foreground">Please sign in to continue.</p>
        </div>
        <div>
          <Button asChild>
            <Link href={`/sign-in?redirect=${pathname}`}>Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
