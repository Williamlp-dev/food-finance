# Next.js 16 Caching Best Practices & Server Actions

Com a chegada do Next.js 16 (e as mudanças introduzidas no Next.js 15), a estratégia de cache evoluiu significativamente com a introdução da diretiva `'use cache'`. Esta documentação cobre as novas práticas recomendadas, focando em como integrar cache com Server Actions.

## 1. A Diretiva `'use cache'`

A grande mudança é a diretiva `'use cache'`, que permite marcar funções ou componentes específicos para seram cacheados pelo framework. Isso substitui a necessidade de configurações complexas de `fetch` ou `unstable_cache` em muitos casos.

### Onde usar?

Você pode usar `'use cache'` em três níveis:

1.  **Nível de Arquivo**: Cacheia todas as exportações (devem ser assíncronas).
2.  **Nível de Componente**: Cacheia a saída renderizada do componente.
3.  **Nível de Função**: Cacheia o resultado de uma função (útil para chamadas de banco de dados ou operações pesadas).

### Exemplo Básico

```typescript
// src/app/products/page.tsx
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache' // Cacheia este componente
  cacheLife('minutes') // Define a vida útil do cache

  const products = await db.query('SELECT * FROM products')

  return (
    <div>
      {products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  )
}
```

## 2. Controlando o Tempo de Cache (`cacheLife`)

A função `cacheLife` permite definir perfis de tempo para o cache. O Next.js fornece perfis padrão:

*   `seconds`
*   `minutes`
*   `hours`
*   `days`
*   `weeks`
*   `max`

```typescript
import { cacheLife } from 'next/cache'

async function getData() {
  'use cache'
  cacheLife('hours') // Mantém fresco por horas
  return fetch('/api/data')
}
```

## 3. Revalidação com Tags (`cacheTag`)

Para invalidar o cache sob demanda (por exemplo, após uma Server Action), você deve usar `cacheTag`.

```typescript
// src/data/get-data.ts
import { cacheTag } from 'next/cache'

export async function getUserSettings(userId: string) {
  'use cache'
  cacheTag(`user-settings-${userId}`) // Tag dinâmica
  
  return db.settings.findMany({ where: { userId } })
}
```

## 4. Server Actions e Invalidação de Cache

Server Actions são usadas para realizar mutações (criar, atualizar, deletar). Após uma mutação, você precisa limpar o cache para que o usuário veja os dados atualizados.

### O Fluxo Correto:

1.  **Recuperação de Dados**: Use `'use cache'` e `cacheTag` na função que busca os dados.
2.  **Server Action**: Realize a mutação no banco de dados.
3.  **Revalidação**: Chame `revalidateTag` dentro da Server Action.

### Exemplo Completo

#### 1. Função de Busca (Cached)

```typescript
// src/data/products.ts
import { cacheTag } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheTag('products-list') // Tag global para a lista
  return db.product.findMany()
}
```

#### 2. Server Action (Mutation)

```typescript
// src/actions/products.ts
'use server'

import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'

export async function createProduct(formData: FormData) {
  const name = formData.get('name')
  
  await db.product.create({
    data: { name }
  })

  // Invalida o cache da lista de produtos
  revalidateTag('products-list')
}
```

#### 3. Componente (UI)

```tsx
// src/app/products/page.tsx
import { getProducts } from '@/data/products'
import { createProduct } from '@/actions/products'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <form action={createProduct}>
        <input name="name" />
        <button type="submit">Add Product</button>
      </form>

      <ul>
        {products.map(p => (
            <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 5. Pontos Importantes e "Gotchas"

*   **Argumentos Serializáveis**: Funções marcadas com `'use cache'` devem receber apenas argumentos serializáveis (primitivos, objetos simples, arrays). Não passe instâncias de classes ou funções.
*   **Closures**: O Next.js automaticamente inclui variáveis do escopo (closure) na chave do cache. Se você usar uma variável externa dentro de uma função cached, ela fará parte da chave única.
*   **Interleaving**: Você pode passar Server Actions como props para componentes cacheados (Client Components), desde que não as invoque *durante* a renderização do componente cacheado.
*   **Cookies**: Se uma Server Action modificar cookies, a UI será re-renderizada, mas dados cacheados via `use cache` **não** serão atualizados automaticamente a menos que você use `revalidateTag` ou `revalidatePath`.

## Resumo das Ferramentas

| Função | Descrição |
| :--- | :--- |
| `'use server'` | Marca uma função como Server Action (executada no servidor, chamável do cliente). |
| `'use cache'` | Marca uma função/componente/arquivo para ser cacheado. |
| `cacheLife(profile)` | Define a duração do cache (`stale`, `revalidate`, `expire`). |
| `cacheTag(tag)` | Adiciona uma tag de revalidação ao cache atual. |
| `revalidateTag(tag)` | Limpa o cache associado à tag específica. |
| `revalidatePath(path)` | Limpa o cache de uma rota inteira. |
