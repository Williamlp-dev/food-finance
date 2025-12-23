# Guia de Animações para Interfaces (UI)

Este documento consolida princípios, técnicas e melhores práticas para criar animações de interface de alta qualidade, focado em performance, usabilidade e estética refinada.

## 1. Princípios Fundamentais

### Responsividade e Feedback
A interface deve parecer "viva" e responder instantaneamente às ações do usuário.
- **Botões:** Aplique uma escala sutil ao clicar para dar feedback tátil.
  - *Recomendação:* `transform: scale(0.97)` no estado `:active`.
- **Tooltips:**
  - Adicione um delay inicial para evitar ativação acidental.
  - **Importante:** Uma vez que um tooltip é aberto, os subsequentes devem abrir *instantaneamente* (sem delay e sem animação) para não frustrar o usuário.

### Velocidade e Percepção
Animações lentas fazem a aplicação parecer lenta.
- **Duração:** Mantenha a maioria das animações de UI abaixo de **300ms**.
- **Percepção:** Uma animação mais rápida (ex: 180ms vs 400ms) aumenta a percepção de performance do sistema.
- **Frequência de Uso:**
  - **Evite** animar ações repetitivas ou usadas centenas de vezes ao dia (ex: navegação por teclado, menus de contexto frequentes).
  - Animações devem ser "propositais" (explicar uma mudança de estado ou hierarquia) ou "delight" (encantar em momentos chave), mas nunca obstáculos.

### Easing (Curvas de Aceleração)
A curva de aceleração define a "personalidade" da animação.
- **Entradas e Saídas (Enter/Exit):** Use **`ease-out`**. Começa rápido e desacelera no final. Isso dá sensação de resposta imediata.
  - *Evite:* `ease-in` para UI, pois começa lento e faz a interface parecer travada.
- **Movimento em Tela:** Use **`ease-in-out`** para elementos que já estão visíveis e apenas mudam de posição. Imita a física natural (acelera e desacelera).
- **Custom Easing:** As curvas padrão do CSS (`ease`, `ease-in-out`) costumam ser "fracas". Use curvas `cubic-bezier` customizadas para movimentos mais energéticos e profissionais.

## 2. Técnicas de Refinamento

### Escala Natural
- **Nunca anime de `scale(0)`:** Objetos reais não surgem do nada absoluto.
- **Solução:** Anime de uma escala inicial maior (ex: `0.9` ou `0.95`) combinada com `opacity: 0` para `1`. Isso cria um efeito de "pop" muito mais natural e elegante.

### Origin-Aware (Consciência de Origem)
Elementos que surgem a partir de um gatilho (botões, menus, popovers) devem parecer "nascer" daquele ponto.
- **Técnica:** Ajuste o `transform-origin` do elemento animado para alinhar com a posição do gatilho (ex: `transform-origin: top left` se o menu abre do canto superior esquerdo do botão).

### Blur (Desfoque)
Use `filter: blur()` para suavizar transições ou mascarar imperfeições visuais durante a troca de estados.
- *Exemplo:* Ao trocar o conteúdo de um botão ou card, aplicar um leve blur durante a transição pode tornar a mudança menos abrupta e mais fluida.

## 3. Ferramentas e Propriedades CSS

### CSS Transforms
A base da maioria das animações performáticas (aceleração de hardware).
- **`translate(x, y)`:** Move elementos.
  - *Dica:* Use porcentagens (ex: `translateY(100%)`) para mover um elemento baseado no seu *próprio* tamanho. Útil para drawers e toasts de altura variável.
- **`scale(x, y)`:** Redimensiona. Afeta filhos (texto, ícones), o que geralmente é desejado para manter a proporção.
- **`rotate(deg)`:** Rotaciona. Útil para ícones (ex: setas de dropdown) ou elementos decorativos.

### Clip Path
Uma propriedade subestimada e poderosa para efeitos de "revelação" (reveal).
- **Como funciona:** Define uma região visível do elemento; o resto é ocultado.
- **Performance:** É acelerado por hardware, evitando reflows caros de layout.
- **Uso:**
  - **Transições de Abas (Tabs):** Duplique a lista de abas, estilize uma como "ativa" e use `clip-path` para revelar apenas a aba selecionada sobre a lista "inativa".
  - **Efeitos de Scroll:** Revele imagens ou textos conforme entram na tela animando de `inset(0 0 100% 0)` (oculto embaixo) para `inset(0)` (visível).
  - **Hold to Delete:** Crie um overlay com `clip-path` que se "enche" (revela) linearmente enquanto o usuário segura o botão.

## 4. Exemplos Práticos

### Hold to Delete (Segurar para Deletar)
Um botão que requer pressão contínua para confirmar uma ação destrutiva.
1. Crie o botão com dois estados sobrepostos (normal e "cheio/ativo").
2. Oculte o estado "ativo" usando `clip-path: inset(0 100% 0 0)` (oculto da direita para a esquerda).
3. No `:active`, transicione para `clip-path: inset(0)`.
4. Use `transition: clip-path 2s linear` para criar o efeito de progresso temporal.

### Toasts (Notificações)
Para empilhar notificações dinamicamente:
- Use `translateY` calculado com base no índice da notificação na pilha.
- `translateY(0)` para o primeiro, `translateY(100% + gap)` para o próximo, etc., ou inverta a lógica para empilhar visualmente.

---

**Resumo para IA:** Ao gerar código de animação, priorize `transform` e `opacity` para performance. Use `ease-out` para entradas, `ease-in-out` para movimentos. Evite `scale(0)`. Considere sempre a origem da animação (`transform-origin`) em relação ao gatilho da ação.
