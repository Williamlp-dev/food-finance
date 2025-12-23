import { format } from "date-fns";
import { CalendarDaysIcon, ShieldIcon } from "lucide-react";
import type { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import type { User } from "@/lib/auth";
import { getServerSession } from "@/lib/get-session";
import { LogoutEverywhereButton } from "./logout-everywhere-button";
import { PasswordForm } from "./password-form";
import { ProfileDetailsForm } from "./profile-details-form";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage(): Promise<React.ReactElement> {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }

  return (
    <div className="max-w-full space-y-6">
      <header className="max-w-full">
        <h1 className="font-semibold text-xl tracking-tight sm:text-2xl">
          Perfil
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Gerencie suas informações pessoais e configurações de conta.
        </p>
      </header>

      <ProfileInformation user={user} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileDetailsForm user={user} />
        <div className="space-y-6">
          <PasswordForm />
          <LogoutEverywhereButton />
        </div>
      </div>
    </div>
  );
}

type ProfileInformationProps = {
  user: User;
};

function ProfileInformation({
  user,
}: ProfileInformationProps): React.ReactElement {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Informações do Perfil</CardTitle>
        <CardDescription className="text-sm">
          Seus dados de conta e status atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center gap-3">
            <UserAvatar
              className="size-20"
              image={user.image}
              name={user.name}
            />
            {user.role ? (
              <Badge className="gap-1.5 text-xs" variant="secondary">
                <ShieldIcon className="size-3" />
                {user.role}
              </Badge>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-lg">{user.name}</h3>
              <p className="truncate text-muted-foreground text-sm">
                {user.email}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <CalendarDaysIcon className="size-4 shrink-0" />
                <span>Membro desde</span>
              </div>
              <p className="font-medium text-sm">
                {format(user.createdAt, "d 'de' MMMM 'de' yyyy")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
