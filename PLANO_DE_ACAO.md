# Plano de Ação - Vusk Operation (urlscan.io)

Este documento descreve o plano de ação detalhado para a implementação do **Vusk Operation**, uma plataforma sênior e de ultra-alta performance para mineração e análise de ofertas baseadas em dados do `urlscan.io`.

---

## 1. Visão Geral e Arquitetura do Sistema

O sistema será construído em uma arquitetura **Full-Stack (React 19 + Express + Vite)**, garantindo que todas as chaves de API sejam escondidas com segurança no servidor e que as requisições para a API do `urlscan.io` não sofram de bloqueios CORS.

```
┌────────────────────────────────────────────────────────┐
│                      FRONTEND                          │
│ - Dashboard Interativo de Alta Frequência              │
│ - Filtros em Tempo Real + Exportação de CSV            │
│ - Visualização Móvel / Responsiva (Mobile-First)       │
└──────────────────────────┬─────────────────────────────┘
                           │ API Call (Sse/Http)
                           ▼
┌────────────────────────────────────────────────────────┐
│                 SERVER (Express v4)                    │
│ - Proxy Seguro para a API do urlscan.io                │
│ - Motor de Mineração Seqüencial & Throttled            │
│ - Validador de Chaves de API                           │
│ - Enriquecedor de Dados via Inteligência Artificial    │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌────────────────────────┐  ┌────────────────────────┐
│       urlscan.io       │  │       Gemini AI        │
│ Busca de URLs, UUIDs,  │  │ Análise de Headline,    │
│ Screenshots e Metas    │  │ Nicho e Pontuação PRO  │
└────────────────────────┘  └────────────────────────┘
```

---

## 2. Abordagem Metodológica para Mineração

Como a API pública de buscas do `urlscan.io` é altamente estruturada e pode sofrer de limites de requisições por minuto, implementaremos um **sistema híbrido e resiliente**:

1. **Proxy Ativo `urlscan.io`**:
   - Montagem de queries Elasticsearch flexíveis focadas no mapeamento dos trackers de checkout e subdomínios de plataformas populares, como:
     - `page.domain:hotmart.com`
     - `page.url:"kiwify.com.br"`
     - `text:eduzz.com`
     - E outras 20+ plataformas (Eduzz, Monetizze, Kirvano, Cakto, Greenn, Lastlink, Braip, Perfectpay, Ticto, Ampliopay, GGCheckout, Pepper, ClickBank, Digistore24, WarriorPlus, JVZoo).
   - Captura do `task.uuid` para buscar screenshots oficiais (`https://urlscan.io/screenshots/{uuid}.png`).

2. **Motor de Enriquecimento por IA (Gemini)**:
   - Para as URLs mineradas, o backend usará a API do Gemini sutilmente para examinar os títulos de páginas, snippets de texto (`page.text` ou `page.title`) e estruturar:
     - **Nicho**: Emagrecimento, Saúde Masculina, Relacionamento, Renda Extra, Finanças, Cripto, etc.
     - **Tipo de Funil**: VSL, Low Ticket, Quiz, Direct Sales.
     - **Score Inteligente & Prioridade**: Pontuação S, A, B ou C de acordo com robustez do domínio, estrutura de headlines e coerência.

3. **Fallback Resiliente (Modo Demonstrativo/Simulador)**:
   - Caso o usuário não possua uma API key paga ou queira demonstrar o poder da plataforma em tempo de café, o sistema contará com um simulador ultrarrealista enriquecido com dezenas de ofertas quentes reais da biblioteca de anúncios atuais para popular o ambiente em tempo real!

---

## 3. Estruturação do Design (Estilo & UX de Luxo)

Seguiremos rigidamente o layout dos prints apresentados:
- **Tema Visual**: "Black & Acid Green" de contraste ultra-alto, misterioso e profissional, utilizando fundo grafite escuro/preto escuro com detalhes em neon brilhante.
- **Tipografia**: Display em `Space Grotesk` ou `Inter` com visualizações técnicas em `JetBrains Mono`.
- **Organização por Abas**:
  1. **Aba Mineração ⛏**: Painel para configuração da API Key, seleção do escopo de tempo (janela de dias), visualizador de progresso step-by-step por tracker em tempo real e lista dos "hits" recém-encontrados.
  2. **Aba Dashboard 📊**: Vista geral agregada, contadores em grandes cards estilizados contendo o total de ofertas por ranking (Elite [S], Topo [A], Alta [B]), filtros robustos de busca (string text, nicho, localidade BR/Gringa, prioridades) e a tabela elegante de ofertas.
  3. **Aba Ajuda / Config 📖**: Instruções limpas de como obter a API Key gratuita de 3 minutos do urlscan.io, como as métricas são calculadas, etc.

---

## 4. Requisitos Mobile-First Obrigatórios

De acordo com as diretrizes sênior do arquiteto:
- **Adaptabilidade Móvel**: A partir de 375px o design será perfeitamente adaptado. Em telas menores, a tabela de ofertas é colapsada para uma visualização elegante em cartões verticais (Bento Cards).
- **Zonas de Toque Ampliadas**: Cada botão de ação, seletor ou aba terá pelo menos `44px` de touch target.
- **Evitar Redirecionamento e Telas Quebradas**: Usaremos gerenciamento fino de erros (`try/catch` no backend e blocos de fallback no frontend) para tratar falhas de API key sem estragar a experiência visual.

---

## 5. Estrutura de Arquivos Proposta

As seguintes adições e modificações serão feitas:
- `server.ts`: Servidor integrado Express rodando em desenvolvimento ou compilado para CommonJS no ambiente Cloud Run.
- `/src/types.ts`: Definições globais das interfaces de ofertas, trackers, estágios de mineração e estatísticas.
- `/src/components/MiningController.tsx`: Painel de controle da varredura inteligente, progresso com trackers e visualização em tempo real de novos hits.
- `/src/components/DashboardAnalytics.tsx`: Tabela rica de ofertas com detalhamento de nicho, rank, país de origem (BR/Gringa), screenshots e filtros avançados.
- `/src/components/AIPresenter.tsx` / `ExplanationPanel.tsx`: Guia com passo-a-passo técnico intuitivo para criar chaves gratuitas na API do urlscan.io.
- `/src/App.tsx`: Gerenciador de abas e contexto de ofertas integrada com localStorage para persistência de hits offline.
- `metadata.json`: Atualizado com o nome correto ("Vusk Operation") e descrição refinada.
- `.env.example`: Atualizado com novos segredos necessários.

---

## 6. Questionário de Ativação do Rigor Técnico (Padrão Sênior)

Para validar a nossa conformidade com o **Roteiro Sênior e Protocolo de Coerência**:

1. **Idempotência no Processamento**: Se o usuário requisitar o minerador duas vezes seguidas ou a conexão oscilar, nossa fila de varredura rejeita execuções paralelas e armazena os resultados com chaves compostas exclusivas (`url` + `tracker_id`), garantindo que não haverá duplicatas no banco local/localStorage.
2. **Mitigação de Falhas da API**: Se a API da urlscan.io retornar limites de requisições (Status 429) ou expirar, o backend responderá com o payload formatado incluindo dicas amigáveis na interface e acionando o modelo heurístico inteligente sem colapsar a aplicação.
3. **Atomicidade de Estados**: Cada oferta minerada com sucesso é empurrada via streaming e adicionada de forma limpa ao estado único, com salvamento assíncrono em lote para assegurar consistência perfeita.

---

**Aguardando a sua autorização para iniciar a criação dos arquivos de suporte e implementação do backend e frontend!**
