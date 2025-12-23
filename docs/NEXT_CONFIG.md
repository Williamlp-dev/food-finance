# next.config.ts - Next.js 16

> Guia completo de configurações do Next.js 16.1.0+

## Índice

1. [Estrutura Básica](#estrutura-básica)
2. [Output Modes](#output-modes)
3. [React Compiler](#react-compiler)
4. [Server Actions](#server-actions)
5. [Imagens](#imagens)
6. [Redirects, Rewrites e Headers](#redirects-rewrites-e-headers)
7. [Cache e Revalidação](#cache-e-revalidação)
8. [Turbopack](#turbopack)
9. [TypeScript](#typescript)
10. [Webpack Customizado](#webpack-customizado)
11. [Server External Packages](#server-external-packages)
12. [Variáveis de Ambiente](#variáveis-de-ambiente)
13. [Opções Experimentais](#opções-experimentais)
14. [Logging](#logging)
15. [Exemplo Completo](#exemplo-completo)

---

## Estrutura Básica

O arquivo `next.config.ts` (ou `.js`/`.mjs`) define configurações do Next.js.

**TypeScript (recomendado):**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suas configurações aqui
};

export default nextConfig;
```

**JavaScript:**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suas configurações aqui
};

module.exports = nextConfig;
```

---

## Output Modes

### Default (Server)

Comportamento padrão para deploy em plataformas com suporte a Node.js.

### Standalone

Cria um bundle mínimo para deploy em containers Docker ou ambientes serverless.

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

**Após o build, copie os assets:**

```bash
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
```

### Static Export

Gera HTML/CSS/JS puro sem servidor Node.js.

```ts
const nextConfig: NextConfig = {
  output: "export",
  distDir: "./dist", // Opcional: diretório de saída customizado
};
```

**Limitações do Static Export:**

- Sem Server Components dinâmicos
- Sem API Routes
- Sem Image Optimization (use loader externo)
- Sem Middleware
- Sem ISR

---

## React Compiler

O React Compiler otimiza automaticamente a renderização de componentes (elimina re-renders desnecessários).

**1. Instale o plugin:**

```bash
pnpm add -D babel-plugin-react-compiler
```

**2. Habilite no config:**

```ts
const nextConfig: NextConfig = {
  reactCompiler: true,
};
```

**Configuração avançada (opt-out de diretórios):**

```ts
const nextConfig: NextConfig = {
  reactCompiler: {
    compilationMode: "annotation", // Apenas componentes com "use memo"
  },
};
```

---

## Server Actions

Configurações para Server Actions:

```ts
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb", // Default: 1mb
      allowedOrigins: ["my-app.com", "staging.my-app.com"], // CSRF protection
    },
  },
};
```

| Opção            | Tipo       | Descrição                                      |
| ---------------- | ---------- | ---------------------------------------------- |
| `bodySizeLimit`  | `string`   | Tamanho máximo do body (ex: "500kb", "2mb")    |
| `allowedOrigins` | `string[]` | Domínios permitidos para chamadas de actions   |

---

## Imagens

Configuração do `next/image`:

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.example.com",
      },
      {
        protocol: "https",
        hostname: "cdn.myapp.com",
        pathname: "/images/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60, // segundos
    dangerouslyAllowSVG: false,
    contentDispositionType: "inline",
  },
};
```

**Para Static Export, use loader externo:**

```ts
const nextConfig: NextConfig = {
  output: "export",
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};
```

---

## Redirects, Rewrites e Headers

### Redirects

Redirecionamentos HTTP:

```ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/old-page",
        destination: "/new-page",
        permanent: true, // 308 (true) ou 307 (false)
      },
      {
        source: "/blog/:slug",
        destination: "/posts/:slug",
        permanent: true,
      },
      // Redirect condicional
      {
        source: "/admin",
        has: [
          {
            type: "cookie",
            key: "role",
            value: "(admin)",
          },
        ],
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};
```

### Rewrites

Proxy de URLs (cliente não vê a URL real):

```ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Rewrite simples
      {
        source: "/api/:path*",
        destination: "https://api.external.com/:path*",
      },
      // Rewrite com fases
      {
        source: "/docs/:path*",
        destination: "https://docs.example.com/:path*",
      },
    ];
  },
};
```

**Rewrites em fases:**

```ts
async rewrites() {
  return {
    beforeFiles: [
      // Executados antes de checar arquivos/rotas
    ],
    afterFiles: [
      // Executados após checar arquivos estáticos
    ],
    fallback: [
      // Executados se nenhuma rota for encontrada
    ],
  };
}
```

### Headers

Headers HTTP customizados:

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://myapp.com",
          },
        ],
      },
    ];
  },
};
```

---

## Cache e Revalidação

### Cache Life (Experimental)

Defina perfis de cache customizados:

```ts
const nextConfig: NextConfig = {
  experimental: {
    cacheLife: {
      // Perfis customizados
      blog: {
        stale: 3600,      // 1 hora até considerar stale
        revalidate: 7200, // 2 horas até revalidar
        expire: 86400,    // 1 dia até expirar completamente
      },
      products: {
        stale: 60,
        revalidate: 300,
        expire: 3600,
      },
    },
  },
};
```

**Uso nos componentes:**

```ts
import { cacheLife } from "next/cache";

export default async function ProductList() {
  "use cache";
  cacheLife("products"); // Usa o perfil definido no config

  return await fetchProducts();
}
```

### Cache Handler Customizado

Integre com Redis, Memcached, etc:

```ts
const nextConfig: NextConfig = {
  cacheHandler: "./lib/cache-handler.ts",
  cacheMaxMemorySize: 0, // Desabilita cache em memória
};
```

**Exemplo de cache handler:**

```ts
// lib/cache-handler.ts
import type { CacheHandler } from "next/dist/server/lib/incremental-cache";

export default class CustomCacheHandler implements CacheHandler {
  async get(key: string) {
    // Buscar do Redis
  }

  async set(key: string, data: any, ctx: any) {
    // Salvar no Redis
  }

  async revalidateTag(tags: string | string[]) {
    // Invalidar tags
  }
}
```

---

## Turbopack

Turbopack é o bundler padrão em desenvolvimento no Next.js 16.

```ts
const nextConfig: NextConfig = {
  // Turbopack é usado automaticamente em dev
  // Para forçar webpack: next dev --webpack
};
```

**Cache do Turbopack:**

```ts
const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCache: true, // Acelera builds subsequentes
  },
};
```

---

## TypeScript

Configurações de TypeScript:

```ts
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Não ignorar erros em produção
    tsconfigPath: "tsconfig.json",
  },
};
```

**⚠️ Nunca use `ignoreBuildErrors: true` em produção!**

---

## Webpack Customizado

Estenda a configuração do Webpack:

```ts
const nextConfig: NextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Adicionar loader customizado
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Adicionar plugin
    config.plugins.push(
      new webpack.DefinePlugin({
        __BUILD_ID__: JSON.stringify(buildId),
      })
    );

    // Aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "@components": path.resolve(__dirname, "src/components"),
    };

    return config;
  },
};
```

---

## Server External Packages

Exclua pacotes do bundling server-side:

```ts
const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "sharp",
    "bcrypt",
    "canvas",
    // Pacotes com binários nativos
  ],
};
```

**Quando usar:**

- Pacotes com código nativo (binding de C/C++)
- Pacotes muito grandes que não funcionam bundled
- Pacotes que gerenciam próprias dependências

---

## Variáveis de Ambiente

### Variáveis públicas (expostas ao browser)

```ts
const nextConfig: NextConfig = {
  env: {
    CUSTOM_VAR: "value", // Disponível como process.env.CUSTOM_VAR
  },
};
```

**Prefixo NEXT_PUBLIC_ é recomendado:**

```env
# .env
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://... # Apenas server
```

### Base Path e Asset Prefix

```ts
const nextConfig: NextConfig = {
  basePath: "/app", // App servido em https://domain.com/app
  assetPrefix: "https://cdn.example.com", // Assets servidos do CDN
};
```

---

## Opções Experimentais

### Dynamic IO

Novo modelo assíncrono para data fetching:

```ts
const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
  },
};
```

### PPR (Partial Pre-rendering)

Renderização parcial de páginas:

```ts
const nextConfig: NextConfig = {
  experimental: {
    ppr: true, // ou "incremental"
  },
};
```

### Static Generation

Controle de geração estática:

```ts
const nextConfig: NextConfig = {
  experimental: {
    staticGenerationRetryCount: 1,       // Tentativas em falha
    staticGenerationMaxConcurrency: 8,   // Páginas em paralelo
    staticGenerationMinPagesPerWorker: 25,
  },
};
```

### Adapter Customizado

Para plataformas de deploy customizadas:

```ts
const nextConfig: NextConfig = {
  experimental: {
    adapterPath: "./lib/custom-adapter.ts",
  },
};
```

---

## Logging

Configure logs do Next.js:

```ts
const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true, // Log URLs completas dos fetches
      hmrRefreshes: true, // Log de HMR
    },
  },
};
```

---

## Outras Opções

| Opção                     | Tipo        | Descrição                                      |
| ------------------------- | ----------- | ---------------------------------------------- |
| `trailingSlash`           | `boolean`   | Adiciona `/` no final das URLs                 |
| `reactStrictMode`         | `boolean`   | Habilita React Strict Mode                     |
| `poweredByHeader`         | `boolean`   | Remove header `X-Powered-By`                   |
| `generateEtags`           | `boolean`   | Gera ETags para cache                          |
| `compress`                | `boolean`   | Habilita compressão gzip                       |
| `productionBrowserSourceMaps` | `boolean` | Source maps em produção                      |
| `optimizePackageImports`  | `string[]`  | Otimiza imports de pacotes                     |
| `pageExtensions`          | `string[]`  | Extensões de arquivos de página                |

```ts
const nextConfig: NextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  productionBrowserSourceMaps: false,
  optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  pageExtensions: ["tsx", "ts", "jsx", "js"],
};
```

---

## Exemplo Completo

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output
  // output: "standalone", // Para Docker

  // React Compiler (React 19)
  reactCompiler: true,

  // Strict Mode
  reactStrictMode: true,

  // Remove header X-Powered-By
  poweredByHeader: false,

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Imagens
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Pacotes externos no server
  serverExternalPackages: ["@prisma/client"],

  // Otimização de imports
  optimizePackageImports: ["lucide-react"],

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

---

## Referências

- [Next.js Configuration Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js)
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- [React Compiler](https://react.dev/learn/react-compiler)
