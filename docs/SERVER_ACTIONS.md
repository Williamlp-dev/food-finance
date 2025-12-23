# Server Actions - Next.js 16 & React 19

> Guia completo de boas práticas para Server Actions no Next.js 16.1.0+ e React 19.2.3

## Índice

1. [Introdução](#introdução)
2. [Definindo Server Actions](#definindo-server-actions)
3. [Hooks do React 19](#hooks-do-react-19)
   - [useActionState](#useactionstate)
   - [useFormStatus](#useformstatus)
4. [Cache e Revalidação](#cache-e-revalidação)
   - [revalidatePath](#revalidatepath)
   - [revalidateTag](#revalidatetag)
   - [updateTag](#updatetag)
5. [Segurança](#segurança)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Progressive Enhancement](#progressive-enhancement)
8. [Configurações](#configurações)
9. [Padrões Recomendados](#padrões-recomendados)

---

## Introdução

Server Actions são funções assíncronas executadas no servidor, permitindo lidar com mutações de dados diretamente em componentes React. No Next.js 16, elas estão habilitadas por padrão e são a forma recomendada para:

- Submissão de formulários
- Mutações de dados (CREATE, UPDATE, DELETE)
- Revalidação de cache
- Operações que requerem segurança server-side

---

## Definindo Server Actions

### Diretiva `"use server"`

A diretiva `"use server"` marca uma função para execução no servidor.

**Em arquivo separado (recomendado):**

```ts
// src/actions/example.ts
"use server";

export async function createItem(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name");
  // ... lógica de criação
}
```

**Inline em componente (menos comum):**

```tsx
export default function Page() {
  async function handleSubmit(formData: FormData) {
    "use server";
    // ... lógica
  }

  return <form action={handleSubmit}>...</form>;
}
```

### Estrutura Recomendada de Arquivos

```
src/
└── actions/
    └── employees/
        ├── types.ts           # Schemas e tipos
        ├── create-employee.ts # Action de criação
        ├── update-employee.ts # Action de atualização
        └── delete-employee.ts # Action de deleção
```

---

## Hooks do React 19

### useActionState

O hook `useActionState` é a forma moderna do React 19 para gerenciar estados de Server Actions.

**Assinatura:**

```ts
const [state, submitAction, isPending] = useActionState(
  action,
  initialState,
  permalink? // opcional para progressive enhancement
);
```

**Exemplo completo:**

```tsx
"use client";

import { useActionState } from "react";
import { createEmployee } from "@/actions/employees/create-employee";

type ActionState = {
  success: boolean;
  error?: string;
  employeeId?: string;
};

const initialState: ActionState = {
  success: false,
  error: undefined,
  employeeId: undefined,
};

export function CreateEmployeeForm() {
  const [state, submitAction, isPending] = useActionState(
    createEmployee,
    initialState
  );

  return (
    <form action={submitAction}>
      <input type="text" name="name" disabled={isPending} />
      <input type="text" name="cpf" disabled={isPending} />

      {state.error && (
        <p className="text-destructive">{state.error}</p>
      )}

      {state.success && (
        <p className="text-green-600">Funcionário criado com sucesso!</p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Criando..." : "Criar Funcionário"}
      </button>
    </form>
  );
}
```

**Server Action compatível:**

```ts
"use server";

type ActionState = {
  success: boolean;
  error?: string;
  employeeId?: string;
};

export async function createEmployee(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // prevState contém o estado anterior
  // formData contém os dados do formulário

  const name = formData.get("name") as string;
  // ... validação e lógica

  return {
    success: true,
    employeeId: "123",
  };
}
```

### useFormStatus

O hook `useFormStatus` fornece informações sobre o estado de submissão do form pai.

**Importante:** Deve ser usado em um componente filho do `<form>`.

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Salvando..." : children}
    </button>
  );
}
```

**Uso no formulário:**

```tsx
import { SubmitButton } from "@/components/submit-button";

export function MyForm() {
  return (
    <form action={myAction}>
      <input name="email" type="email" />
      <SubmitButton>Enviar</SubmitButton>
    </form>
  );
}
```

---

## Cache e Revalidação

### revalidatePath

Invalida o cache de uma rota específica.

```ts
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  await db.post.create({ ... });

  // Revalida a página de posts
  revalidatePath("/posts");

  // Revalida com layout (inclui layouts aninhados)
  revalidatePath("/posts", "layout");

  // Revalida apenas a página
  revalidatePath("/posts", "page");
}
```

### revalidateTag

Invalida cache baseado em tags (útil para dados compartilhados entre rotas).

```ts
"use server";

import { revalidateTag } from "next/cache";

export async function updateProduct(formData: FormData) {
  await db.product.update({ ... });

  // Invalida todos os fetches com tag "products"
  revalidateTag("products");

  // Com profile "max" para stale-while-revalidate
  revalidateTag("products", "max");
}
```

**Definindo tags no fetch:**

```ts
const products = await fetch("https://api.example.com/products", {
  next: { tags: ["products"] },
});
```

### updateTag

Novo no Next.js 16! Invalida o cache **imediatamente** sem usar stale-while-revalidate. Ideal para cenários de "read-your-own-writes".

```ts
"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function createEmployee(formData: FormData) {
  const employee = await db.employee.create({
    data: {
      name: formData.get("name"),
    },
  });

  // Invalida imediatamente - o usuário verá o novo dado
  updateTag("employees");
  updateTag(`employee-${employee.id}`);

  redirect(`/employees/${employee.id}`);
}
```

**Quando usar cada um:**

| Função          | Uso                                           | Comportamento          |
| --------------- | --------------------------------------------- | ---------------------- |
| `revalidatePath`| Invalidar rota específica                     | Stale-while-revalidate |
| `revalidateTag` | Invalidar por tag em múltiplas rotas          | Stale-while-revalidate |
| `updateTag`     | Invalidar imediatamente (read-your-own-writes)| Imediato               |

---

## Segurança

### Autenticação e Autorização

**CRÍTICO:** Toda Server Action é um endpoint HTTP público. Sempre valide autenticação e autorização.

```ts
"use server";

import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";

export async function deleteEmployee(employeeId: string) {
  const session = await getServerSession();

  // Verificação de autenticação
  if (!session?.user) {
    unauthorized(); // Retorna 401 automaticamente
  }

  // Verificação de autorização
  if (session.user.role !== "admin") {
    return { success: false, error: "Sem permissão para esta ação" };
  }

  // Verificação de ownership (se aplicável)
  const employee = await db.employee.findUnique({
    where: { id: employeeId },
  });

  if (employee?.userId !== session.user.id) {
    return { success: false, error: "Você não tem acesso a este recurso" };
  }

  await db.employee.delete({ where: { id: employeeId } });
  return { success: true };
}
```

### Recursos de Segurança Built-in

O Next.js 16 inclui:

1. **IDs de Action Criptografados:** IDs não-determinísticos recalculados entre builds
2. **Dead Code Elimination:** Actions não utilizadas são removidas do bundle do cliente
3. **Validação Automática:** O framework valida que a action existe antes de executar

### Validação de Dados

Sempre valide os dados recebidos com uma biblioteca como Zod:

```ts
"use server";

import { z } from "zod";

const employeeSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  email: z.string().email("Email inválido"),
  salary: z.number().positive("Salário deve ser positivo"),
});

export async function createEmployee(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = employeeSchema.safeParse({
    name: formData.get("name"),
    cpf: formData.get("cpf"),
    email: formData.get("email"),
    salary: Number(formData.get("salary")),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Dados validados em parsed.data
  const { name, cpf, email, salary } = parsed.data;
  // ...
}
```

---

## Tratamento de Erros

### Erros Esperados como Valores de Retorno

A melhor prática no React 19 é **modelar erros esperados como valores de retorno**, não usar `try/catch` com throws:

```ts
"use server";

type ActionResult =
  | { success: true; data: Employee }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createEmployee(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Validação - retorna erro, não lança
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Verificação de duplicidade
  const existing = await db.employee.findUnique({
    where: { cpf: parsed.data.cpf },
  });

  if (existing) {
    return {
      success: false,
      error: "Já existe um funcionário com este CPF",
    };
  }

  // Criação
  const employee = await db.employee.create({
    data: parsed.data,
  });

  return { success: true, data: employee };
}
```

### Erros Inesperados

Para erros inesperados (falhas de banco, rede, etc.), use error boundaries:

```ts
"use server";

export async function createEmployee(formData: FormData) {
  try {
    const employee = await db.employee.create({ ... });
    return { success: true, data: employee };
  } catch (error) {
    // Log para debugging (não expor detalhes ao cliente)
    console.error("Erro ao criar funcionário:", error);

    // Retorna mensagem genérica
    return {
      success: false,
      error: "Ocorreu um erro inesperado. Tente novamente.",
    };
  }
}
```

---

## Progressive Enhancement

### Forms Funcionais sem JavaScript

Use o terceiro argumento do `useActionState` para funcionar mesmo sem JS:

```tsx
"use client";

import { useActionState } from "react";
import { createEmployee } from "@/actions/employees/create-employee";

export function CreateEmployeeForm() {
  const [state, submitAction] = useActionState(
    createEmployee,
    { success: false },
    "/dashboard/funcionarios/novo" // Permalink para fallback
  );

  return (
    <form action={submitAction}>
      {/* Se JS não carregar, o form ainda funciona via POST */}
      <input name="name" required />
      <button type="submit">Criar</button>
    </form>
  );
}
```

### Componente Form do Next.js

O Next.js oferece um componente `<Form>` otimizado:

```tsx
import Form from "next/form";
import { createEmployee } from "@/actions/employees/create-employee";

export function CreateEmployeeForm() {
  return (
    <Form action={createEmployee}>
      <input name="name" required />
      <button type="submit">Criar</button>
    </Form>
  );
}
```

---

## Configurações

### Limite de Tamanho do Body

Configure o tamanho máximo do request body no `next.config.ts`:

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb", // Default: 1mb
    },
  },
};

export default config;
```

### Allowed Origins (CSRF Protection)

Configure origens permitidas para Server Actions:

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["my-app.com", "staging.my-app.com"],
    },
  },
};

export default config;
```

---

## Padrões Recomendados

### Estrutura de Tipos

```ts
// src/actions/types.ts

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type FormActionState<T = void> = ActionResult<T> | null;
```

### Template de Server Action

```ts
// src/actions/[resource]/create-[resource].ts
"use server";

import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import type { ActionResult } from "@/actions/types";
import { resourceSchema, type ResourceFormData } from "./types";

export async function createResource(
  prevState: ActionResult<{ id: string }>,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  // 1. Autenticação
  const session = await getServerSession();
  if (!session?.user) {
    unauthorized();
  }

  // 2. Validação
  const parsed = resourceSchema.safeParse({
    field1: formData.get("field1"),
    field2: formData.get("field2"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Autorização (se necessário)
  // ...

  // 4. Mutação
  try {
    const resource = await prisma.resource.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    // 5. Revalidação
    revalidatePath("/dashboard/resources");

    return { success: true, data: { id: resource.id } };
  } catch (error) {
    console.error("Erro ao criar resource:", error);
    return { success: false, error: "Erro ao criar recurso" };
  }
}
```

### Template de Formulário Cliente

```tsx
// src/components/[resource]/create-[resource]-form.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createResource } from "@/actions/[resource]/create-resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/actions/types";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

export function CreateResourceForm() {
  const [state, submitAction, isPending] = useActionState<
    ActionResult<{ id: string }>,
    FormData
  >(createResource, { success: false, error: "" });

  return (
    <form action={submitAction} className="space-y-4">
      <div>
        <Label htmlFor="field1">Campo 1</Label>
        <Input
          id="field1"
          name="field1"
          disabled={isPending}
          aria-describedby="field1-error"
        />
        {state?.fieldErrors?.field1 && (
          <p id="field1-error" className="text-sm text-destructive">
            {state.fieldErrors.field1[0]}
          </p>
        )}
      </div>

      {state?.error && !state.success && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Recurso criado com sucesso!</p>
      )}

      <SubmitButton />
    </form>
  );
}
```

---

## Checklist de Boas Práticas

- [ ] Usar `"use server"` no topo do arquivo de actions
- [ ] Sempre validar autenticação com `getServerSession()`
- [ ] Usar `unauthorized()` para requests não autenticados
- [ ] Validar dados com Zod ou similar
- [ ] Retornar erros como valores, não lançar exceptions
- [ ] Usar `useActionState` para gerenciar estado no cliente
- [ ] Usar `useFormStatus` em componentes de botão
- [ ] Escolher entre `revalidatePath`, `revalidateTag` ou `updateTag` conforme o caso
- [ ] Não expor detalhes de erros internos ao cliente
- [ ] Tipar explicitamente os retornos das actions
- [ ] Separar actions por recurso em diretórios próprios

---

## Referências

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React 19 useActionState](https://react.dev/reference/react/useActionState)
- [React 19 useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [Next.js Data Security Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/data-security)
