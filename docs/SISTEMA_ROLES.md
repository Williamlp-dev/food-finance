# 🛡️ Sistema de Roles (Permissões) - Better Auth

Este documento detalha como funciona o sistema de roles (papéis/permissões) no projeto.

---

## 📋 Visão Geral

O projeto implementa um sistema básico de **Role-Based Access Control (RBAC)** usando Better Auth, onde os usuários podem ter diferentes níveis de acesso baseado em sua role.

### Tipo de Role

```typescript
role: string | null
```

- **Campo opcional** no banco de dados
- **Tipo:** string (texto livre)
- **Valor padrão:** `null` (usuário comum)
- **Valor especial:** `"admin"` (administrador)

---

## 🔧 Configuração no Better Auth

### Arquivo: `src/lib/auth.ts` (linhas 55-60)

```typescript
user: {
  additionalFields: {
    role: {
      type: "string",
      input: false, // ❌ Role NÃO pode ser definida no cadastro
    },
  },
}
```

**Importante:**
- `input: false` significa que a **role não pode ser setada pelo usuário** durante o cadastro
- A role deve ser atribuída **manualmente** direto no banco de dados
- O Better Auth gerencia este campo adicional automaticamente

---

## 💾 Banco de Dados (Prisma)

### Arquivo: `prisma/schema.prisma` (linha 23)

```prisma
model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean
  image         String?
  role          String?   // ← Campo opcional
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}
```

**Estrutura:**
- `role String?` - Campo opcional (pode ser `null`)
- Não possui enum - aceita qualquer string
- Sem valor padrão - inicia como `null`

---

## 🔐 Como Funciona

### 1. **No Cadastro**

```typescript
// src/app/(auth)/sign-up/sign-up-form.tsx
await authClient.signUp.email({
  email,
  password,
  name,
  // ⚠️ Não é possível definir role aqui!
})
```

**Resultado:**
- Novo usuário criado com `role = null`
- Usuário comum **sem privilégios administrativos**

---

### 2. **Atribuindo Role "admin"**

Para tornar um usuário administrador, você precisa **atualizar manualmente** no banco de dados:

#### Opção A: Via SQL direto

```sql
UPDATE "user" 
SET role = 'admin' 
WHERE email = 'seu@email.com';
```

#### Opção B: Via Prisma Studio

```bash
npx prisma studio
```

1. Abra a tabela `User`
2. Encontre o usuário
3. Edite o campo `role` para `"admin"`
4. Salve

#### Opção C: Criar seed no Prisma (recomendado para desenvolvimento)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.updateMany({
    where: { email: 'admin@example.com' },
    data: { role: 'admin' }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

### 3. **Verificação de Permissão**

#### No Frontend (UI condicional)

**Arquivo:** `src/components/user-dropdown.tsx` (linha 51)

```typescript
export function UserDropdown({ user }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuContent>
        {/* Item só aparece se for admin */}
        {user.role === "admin" && <AdminItem />}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AdminItem() {
  return (
    <DropdownMenuItem asChild>
      <Link href="/admin">
        <ShieldIcon className="size-4" /> <span>Admin</span>
      </Link>
    </DropdownMenuItem>
  )
}
```

**Comportamento:**
- ✅ Se `user.role === "admin"`: Link "Admin" aparece no menu dropdown
- ❌ Se `user.role !== "admin"`: Link fica oculto

---

#### No Backend (Páginas Protegidas)

**Arquivo:** `src/app/(main)/admin/page.tsx` (linhas 14-16)

```typescript
export default async function AdminPage() {
  const session = await getServerSession()
  const user = session?.user

  // 1. Verifica se está logado
  if (!user) unauthorized() // Redireciona para /sign-in

  // 2. Verifica se é admin
  if (user.role !== "admin") forbidden() // HTTP 403

  // Página admin só chega aqui se for admin
  return (
    <main>
      <h1>Admin</h1>
      <p>You have administrator access.</p>
    </main>
  )
}
```

---

#### Em Server Actions

**Arquivo:** `src/app/(main)/admin/actions.ts` (linhas 7-18)

```typescript
"use server"

export async function deleteApplication() {
  const session = await getServerSession()
  const user = session?.user

  // 1. Verifica autenticação
  if (!user) unauthorized()

  // 2. Verifica permissão
  if (user.role !== "admin") forbidden()

  // Ação sensível só executa se for admin
  // Delete app...
}
```

**Segurança:**
- ❌ **Nunca confie apenas na UI** para controle de acesso
- ✅ **Sempre valide no backend** (Server Components e Server Actions)

---

#### No Dashboard (Badge de Role)

**Arquivo:** `src/app/(main)/dashboard/page.tsx` (linhas 69-74)

```typescript
function ProfileInformation({ user }: ProfileInformationProps) {
  return (
    <Card>
      <CardContent>
        {/* Badge só aparece se houver role */}
        {user.role && (
          <Badge>
            <ShieldIcon className="size-3" />
            {user.role} {/* Exibe: "admin" */}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 📊 Fluxo de Verificação

```
┌─────────────────────────────────────────────┐
│  Usuário tenta acessar /admin               │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │ Está logado?    │
         └────┬───────┬────┘
              │ Não   │ Sim
              ▼       ▼
        unauthorized() │
        (→ /sign-in)   │
                       ▼
              ┌─────────────────┐
              │ role === "admin"?│
              └────┬───────┬────┘
                   │ Não   │ Sim
                   ▼       ▼
             forbidden()  Acesso
             (HTTP 403) permitido ✅
```

---

## 🎯 Resumo de Verificações

### Onde a Role é Verificada

| Local | Tipo | Verificação | Ação |
|-------|------|-------------|------|
| `user-dropdown.tsx` | Frontend UI | `user.role === "admin"` | Mostrar/ocultar link |
| `dashboard/page.tsx` | Frontend UI | `user.role && ...` | Exibir badge |
| `admin/page.tsx` | Server Component | `user.role !== "admin"` | `forbidden()` |
| `admin/actions.ts` | Server Action | `user.role !== "admin"` | `forbidden()` |

---

## 🔒 Modelo de Segurança

### ✅ Boas Práticas Implementadas

1. **Role não pode ser auto-atribuída** (`input: false`)
2. **Verificação em múltiplas camadas:**
   - UI (melhor UX)
   - Server Component (proteção de página)
   - Server Action (proteção de ações)
3. **Redirecionamento apropriado:**
   - `unauthorized()` → `/sign-in` (não logado)
   - `forbidden()` → HTTP 403 (sem permissão)

### ⚠️ Limitações Atuais

1. **Apenas 2 níveis:** usuário comum (`null`) e admin (`"admin"`)
2. **Sem hierarquia de roles** (ex: moderador, super-admin)
3. **Sem permissões granulares** (ex: "can_delete_users")
4. **Role é string livre** (sem enum/validação)

---

## 🚀 Como Expandir o Sistema

### 1. Adicionar Mais Roles

```typescript
// src/lib/auth.ts
export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]
```

### 2. Criar Helper de Verificação

```typescript
// src/lib/roles.ts
export function hasRole(user: User, role: string): boolean {
  return user.role === role
}

export function hasAnyRole(user: User, roles: string[]): boolean {
  return roles.includes(user.role ?? '')
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin' || user.role === 'super_admin'
}
```

### 3. Usar Enum no Prisma (Opcional)

```prisma
enum Role {
  USER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}

model User {
  // ...
  role Role? @default(USER)
}
```

⚠️ **Nota:** Better Auth pode ter conflitos com enums do Prisma. Teste bem se for implementar.

---

## 📁 Arquivos Importantes

### Configuração
- **`src/lib/auth.ts`** - Definição de role no Better Auth
- **`prisma/schema.prisma`** - Schema do banco de dados

### Verificações no Frontend
- **`src/components/user-dropdown.tsx`** - Menu dropdown com link admin
- **`src/app/(main)/dashboard/page.tsx`** - Badge de role

### Verificações no Backend
- **`src/app/(main)/admin/page.tsx`** - Página protegida
- **`src/app/(main)/admin/actions.ts`** - Server action protegida

---

## 🤔 Perguntas Frequentes

### Como tornar um usuário admin?
- Execute SQL direto no banco: `UPDATE "user" SET role = 'admin' WHERE email = 'email@example.com'`
- Ou use Prisma Studio: `npx prisma studio`

### Por que role não pode ser definida no cadastro?
- Segurança: Evita que qualquer um se registre como admin
- `input: false` bloqueia isso no Better Auth

### Posso ter roles customizadas além de "admin"?
- Sim! O campo é string livre
- Exemplo: `"moderator"`, `"premium"`, etc.
- Mas você precisa criar as verificações manualmente

### Como proteger rotas da API?
```typescript
export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session?.user) return unauthorized()
  if (session.user.role !== 'admin') return forbidden()
  
  // Lógica da API
}
```

---

## ⚡ Resumo Rápido

✅ **Role é opcional** (padrão: `null`)  
✅ **Não pode ser auto-atribuída** no cadastro  
✅ **Deve ser setada manualmente** no banco  
✅ **Verificação em múltiplas camadas** (UI + backend)  
✅ **Apenas "admin" tem significado especial** atualmente  
✅ **Fácil de expandir** para mais roles no futuro
