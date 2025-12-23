# 📋 Fluxo de Autenticação - Better Auth

Este documento detalha o fluxo completo de login e cadastro implementado no projeto usando Better Auth.

---

## 🔐 Cadastro (Sign Up)

### Arquivo: `src/app/(auth)/sign-up/sign-up-form.tsx`

### Validações no Frontend

1. **Nome** (`name`)
   - ✅ Campo obrigatório
   - ✅ Mínimo: 1 caractere

2. **Email** (`email`)
   - ✅ Validação de formato de email
   - ✅ Mensagem de erro personalizada

3. **Senha** (`password`)
   - ✅ Mínimo: 8 caracteres
   - ✅ Deve conter pelo menos 1 caractere especial (ex: `!@#$%`)
   - ✅ Campo obrigatório
   - Schema definido em: `src/lib/validation.ts`

4. **Confirmação de Senha** (`passwordConfirmation`)
   - ✅ Campo obrigatório
   - ✅ Verificação: deve ser igual à senha digitada

### Fluxo de Cadastro

```typescript
// 1. Usuário preenche o formulário
{ name, email, password, passwordConfirmation }

// 2. Validação do formulário (Zod Schema)
signUpSchema.parse(data)

// 3. Chamada para Better Auth
await authClient.signUp.email({
  email,
  password,
  name,
  callbackURL: "/email-verified"
})

// 4. Better Auth cria a conta e envia email de verificação

// 5. Redirecionamento para /dashboard
```

### Middleware de Validação de Senha (Backend)

**Arquivo:** `src/lib/auth.ts` (linhas 62-77)

O Better Auth possui um **hook `before`** que intercepta as requisições antes de processá-las:

```typescript
hooks: {
  before: createAuthMiddleware(async (ctx) => {
    if (
      ctx.path === "/sign-up/email" ||
      ctx.path === "/reset-password" ||
      ctx.path === "/change-password"
    ) {
      const password = ctx.body.password || ctx.body.newPassword;
      const { error } = passwordSchema.safeParse(password);
      if (error) {
        throw new APIError("BAD_REQUEST", {
          message: "Password not strong enough",
        });
      }
    }
  })
}
```

**Rotas verificadas:**
- `/sign-up/email` - Cadastro
- `/reset-password` - Redefinir senha
- `/change-password` - Trocar senha

---

## 🔑 Login (Sign In)

### Arquivo: `src/app/(auth)/sign-in/sign-in-form.tsx`

### Validações no Frontend

1. **Email** (`email`)
   - ✅ Validação de formato de email
   - ✅ Campo obrigatório

2. **Senha** (`password`)
   - ✅ Campo obrigatório
   - ❌ **Não há validação de força de senha no login** (apenas no cadastro)

3. **Lembrar-me** (`rememberMe`)
   - ✅ Checkbox opcional (padrão: `false`)

### Fluxo de Login com Email/Senha

```typescript
// 1. Usuário preenche credenciais
{ email, password, rememberMe }

// 2. Validação do formulário
signInSchema.parse(data)

// 3. Chamada para Better Auth
await authClient.signIn.email({
  email,
  password,
  rememberMe
})

// 4. Better Auth verifica credenciais

// 5. Se sucesso: Redirecionamento para /dashboard (ou redirect param)
// 6. Se erro: Exibe mensagem de erro
```

### Fluxo de Login Social

**Provedores disponíveis:** Google e GitHub

```typescript
// 1. Usuário clica no botão de provedor social
handleSocialSignIn("google") // ou "github"

// 2. Chamada para Better Auth
await authClient.signIn.social({
  provider,
  callbackURL: redirect ?? "/dashboard"
})

// 3. Redirecionamento para página de OAuth do provedor

// 4. Callback após autorização

// 5. Better Auth cria/atualiza conta automaticamente
```

**Configuração:**
- **Arquivo:** `src/lib/auth.ts` (linhas 12-21)
- Variáveis de ambiente necessárias:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`

---

## ✉️ Verificação de Email

### Configuração: `src/lib/auth.ts` (linhas 33-43)

```typescript
emailVerification: {
  sendOnSignUp: true, // ✅ Envia email automaticamente no cadastro
  autoSignInAfterVerification: true, // ✅ Login automático após verificar
  async sendVerificationEmail({ user, url }) {
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      text: `Click the link to verify your email: ${url}`,
    });
  }
}
```

### Status de Verificação

- **Campo no banco:** `user.emailVerified` (boolean)
- **Não bloqueia login:** O usuário pode acessar `/dashboard` sem verificar email
- **Alerta visual:** Banner amarelo exibido no dashboard se `emailVerified === false`

### Página de Verificação: `/verify-email`

**Arquivo:** `src/app/(main)/verify-email/page.tsx`

```typescript
// Verificações:
// 1. Usuário está logado?
if (!user) unauthorized()

// 2. Email já verificado?
if (user.emailVerified) redirect("/dashboard")

// 3. Se não verificado: Exibe página com botão para reenviar email
```

---

## 🔒 Redefinição de Senha

### Configuração: `src/lib/auth.ts` (linhas 22-32)

```typescript
emailAndPassword: {
  enabled: true,
  async sendResetPassword({ user, url }) {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `Click the link to reset your password: ${url}`,
    });
  }
}
```

### Fluxo "Esqueci minha senha"

1. **Usuário clica em "Forgot your password?"** no formulário de login
2. **Redirecionamento para:** `/forgot-password`
3. **Insere email** e solicita reset
4. **Better Auth envia email** com link de redefinição
5. **Usuário clica no link** do email
6. **Redirecionamento para:** `/reset-password?token=...`
7. **Usuário insere nova senha** (validação aplicada via middleware)
8. **Senha atualizada** e usuário pode fazer login

---

## 📊 Resumo de Verificações

### No Cadastro (Sign Up)

| Validação | Frontend | Backend | Onde |
|-----------|----------|---------|------|
| Nome obrigatório | ✅ | - | `sign-up-form.tsx` |
| Email válido | ✅ | - | `sign-up-form.tsx` |
| Senha mínimo 8 caracteres | ✅ | ✅ | `validation.ts` + `auth.ts` |
| Senha com caractere especial | ✅ | ✅ | `validation.ts` + `auth.ts` |
| Senhas coincidem | ✅ | - | `sign-up-form.tsx` |
| Email único | - | ✅ | Better Auth (banco de dados) |

### No Login (Sign In)

| Validação | Frontend | Backend | Onde |
|-----------|----------|---------|------|
| Email válido | ✅ | - | `sign-in-form.tsx` |
| Senha obrigatória | ✅ | - | `sign-in-form.tsx` |
| Credenciais corretas | - | ✅ | Better Auth |
| Email verificado | ❌ | ❌ | **Não bloqueia acesso** |

### No Reset de Senha

| Validação | Frontend | Backend | Onde |
|-----------|----------|---------|------|
| Senha mínimo 8 caracteres | - | ✅ | `auth.ts` (middleware) |
| Senha com caractere especial | - | ✅ | `auth.ts` (middleware) |

---

## 🛠️ Arquivos Importantes

### Configuração de Autenticação
- **`src/lib/auth.ts`** - Configuração central do Better Auth
- **`src/lib/auth-client.ts`** - Cliente para uso no frontend
- **`src/lib/validation.ts`** - Schema de validação de senha
- **`src/app/api/auth/[...all]/route.ts`** - Rota API do Better Auth

### Páginas de Autenticação
- **`src/app/(auth)/sign-in/sign-in-form.tsx`** - Formulário de login
- **`src/app/(auth)/sign-up/sign-up-form.tsx`** - Formulário de cadastro
- **`src/app/(auth)/forgot-password/page.tsx`** - Solicitar reset de senha
- **`src/app/(auth)/reset-password/page.tsx`** - Redefinir senha

### Páginas Protegidas
- **`src/app/(main)/dashboard/page.tsx`** - Dashboard do usuário
- **`src/app/(main)/verify-email/page.tsx`** - Verificação de email

---

## 🚨 Importante

1. **Verificação de email NÃO é obrigatória:** 
   - `requireEmailVerification: false` (comentado no código)
   - Usuário pode acessar dashboard sem verificar email
   - Recomendação: ativar se quiser bloquear acesso

2. **Middleware de senha:** 
   - Valida TODAS as operações de senha (cadastro, reset, mudança)
   - Garante consistência entre frontend e backend

3. **Login social:**
   - Email é considerado automaticamente verificado
   - Não requer configuração adicional de senha

4. **RememberMe:**
   - Implementado no formulário de login
   - Controla duração da sessão do usuário
