"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LoadingButton } from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import type { User } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  image: z.string().optional().nullable(),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

type ProfileDetailsFormProps = {
  user: User;
};

export function ProfileDetailsForm({
  user,
}: ProfileDetailsFormProps): React.ReactElement {
  const router = useRouter();

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name ?? "",
      image: user.image ?? null,
    },
  });

  async function onSubmit({ name, image }: UpdateProfileValues): Promise<void> {
    const { error } = await authClient.updateUser({ name, image });
    if (error) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
      router.refresh();
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        form.setValue("image", base64, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  }

  const imagePreview = form.watch("image");

  const loading = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Foto de perfil</FormLabel>
                  <FormControl>
                    <Input
                      accept="image/*"
                      onChange={(e) => handleImageChange(e)}
                      type="file"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {imagePreview ? (
              <div className="relative size-16">
                <UserAvatar
                  className="size-16"
                  image={imagePreview}
                  name={user.name}
                />
                <Button
                  aria-label="Remover imagem"
                  className="absolute -top-2 -right-2 size-6 rounded-full"
                  onClick={() => form.setValue("image", null)}
                  type="button"
                  variant="ghost"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ) : null}

            <LoadingButton loading={loading} type="submit">
              Salvar alterações
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
