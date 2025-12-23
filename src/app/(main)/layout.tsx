import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getServerSession } from "@/lib/get-session";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.ReactElement> {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>;
}
