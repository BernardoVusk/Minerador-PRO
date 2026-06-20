# Planejamento - Vusk Operation

Fonte de verdade para decisões de arquitetura, schema e fases de lançamento. Atualizado conforme o sistema evolui — substitui o `PLANO_DE_ACAO.md` (que documentava só a etapa inicial do minerador de ofertas via urlscan.io).

## 1. O que é o sistema

Vusk Operation é o "segundo cérebro" pessoal do Bernardo para operar tráfego pago (principalmente Meta Ads), criar e escalar ofertas (low ticket e high ticket), guardar criativos vencedores, gerar copy/páginas de venda com IA e documentar processos (playbooks). Uso interno — ele e o time da empresa, não é um produto aberto ao público.

## 2. Stack

- **Frontend**: React 19 + Vite 6 + Tailwind 4
- **Backend**: Express (`server.ts`), compilado para `dist/server.cjs` em produção (Vercel via `api/index.ts` / Netlify Functions legadas em `netlify/functions/`)
- **Banco**: Supabase (Postgres) — projeto `dryfjdfuxvsdgysezjxp`, RLS habilitado mas com policies públicas (sistema é single-operator, não há autenticação real)
- **IA**: Gemini (`@google/genai`) para chat de agentes, ângulos de copy, dossiê de público e construção de funil
- **Ads**: Facebook Marketing API (OAuth + insights/campanhas/adsets)

## 3. Estado atual por área

### Mineração de Ofertas
Varre 30 plataformas de checkout/tracker (Hotmart, Kiwify, Eduzz, ClickBank etc.) via `/api/scan`, usando urlscan.io com fallback para banco simulado de ofertas reais quando a API falha. Classifica nicho, tipo de funil e score heurístico (rank S/A/B/C). Persiste em `offer_hits`, com cache em localStorage. `DashboardPanel` (não é placeholder — ver seção Dashboard/Help) consome esses hits com filtros avançados e permite re-análise pontual de uma oferta via Gemini (`/api/analyze`).

### Cofre de Criativos
Upload, compressão (browser-image-compression) e organização de criativos por nicho/tags, com URL de cópia rápida. Totalmente implementado. Tabela `creatives` + bucket de Storage `creatives`.

### Radar Meta Ads
CRUD de categorias/keywords para pesquisa manual na Ads Library (`radar_categories`, `radar_keywords`). Ainda não há integração real com a Ads Library — é organização manual com seed de demonstração.

### Agentes IA
Personas configuráveis (prompt + avatar) com chat persistente (`agents`, `chat_sessions`, `chat_messages`), suporte a anexos, via `/api/agents/chat` (Gemini). 3 agentes seed: Redator VSL de Elite, Growth Hacker de Ofertas, Espião Criativo IA.

### Geradores de Copy (IA)
- **Ângulos de Copy** (`/api/generate-angles`): 8 ângulos (dor, curiosidade, prova social, contra-intuitivo, autoridade, comparação, medo/urgência, solução simples).
- **Dossiê de Público** (`/api/generate-audience-dossier`): persona, dor latente, falhas do mercado, arsenal de copy, adaptado por nicho (saúde/emagrecimento, design/arquitetura, SaaS, geral).
- **Landpage Builder** (`/api/generate-landpage`): estrutura completa de página (hero, identificação, agitação, mecanismo, produto, prova social, oferta/order bump, garantia, objeções, FAQ, fechamento) + prompt pronto para colar no AI Studio.
- **Quiz Builder** (`/api/generate-quiz`): funil de quiz de 14 etapas com lógica de branching, perfis e oferta final.

Todos com fallback de templates mockados quando `GEMINI_API_KEY` não está configurada.

### Playbooks
Procedimentos operacionais com editor de texto rico, busca por título/conteúdo, reordenação de passos. Tabela `playbooks`, com fallback em localStorage.

### Integrações
OAuth completo do Facebook Ads (popup, troca de token curto→longo de 60 dias), insights de conta/campanhas/adsets. Chave Gemini customizável por operador. Outras integrações marcadas "em breve".

### Auth/Config
Sem autenticação real — operador identifica o nome na `LandingScreen`, estado fica em `sessionStorage`. Credenciais de Facebook/Gemini são por operador, em localStorage.

### Dashboard/Help
`DashboardPanel` já é um painel completo (não é placeholder): stats cards (Total/Elite/Topo/Alta), filtros avançados (nicho, mercado, rank, tipo de funil, categoria), busca, ordenação, tabela responsiva (cards no mobile), modal de screenshot via urlscan.io e modal de re-análise de oferta via Gemini. `HelpPanel` documenta o fluxo de obtenção de chave urlscan.io, a heurística de ranks S/A/B/C e as plataformas monitoradas.

## 4. Schema atual do banco (Supabase)

Baseline registrado em [`supabase/migrations/20260620161751_baseline_schema.sql`](supabase/migrations/20260620161751_baseline_schema.sql).

| Tabela | Resumo |
|---|---|
| `agents` | Personas de IA (nome, prompt, avatar) |
| `chat_sessions` | Sessões de chat por agente |
| `chat_messages` | Mensagens (role user/assistant) por sessão |
| `creatives` | Metadados de criativos (tamanho, tags, nicho) |
| `offer_hits` | Ofertas minadas (id text, score, rank, nicho, tipo) |
| `playbooks` | Procedimentos (título + passos em jsonb) |
| `radar_categories` | Categorias de keywords do radar Meta Ads |
| `radar_keywords` | Keywords vinculadas a uma categoria |

Todas com RLS habilitado e policies públicas (sem distinção de usuário — coerente com o modelo single-operator atual).

## 5. Decisões de arquitetura (log)

- 2026-06-20: Repo importado para `d:\VuskOperation`, Supabase CLI linkado ao projeto `dryfjdfuxvsdgysezjxp`. Mudanças de schema a partir de agora seguem o fluxo de migrations versionadas (`supabase/migrations/`) + `supabase db push`, conforme regra 6 do `CLAUDE.md`.

## 6. Próximos passos / Roadmap

Roadmap pensado **mobile-first**: toda melhoria abaixo deve funcionar bem em tela pequena antes de ser considerada concluída. Dividido em melhorias nas funcionalidades existentes (Parte A) e apostas de funcionalidades novas inspiradas em players reais do mercado de tráfego pago/afiliados — tipo AdSpy, BigSpy, PiPiADS, gestores de Business Manager (Parte B).

**Nota de transparência**: o exemplo de "camuflador de criativos para o Facebook não reconhecer ofertas BLACK e aprovar" não entrou no roadmap como cloaking literal (mostrar conteúdo diferente para o revisor automático do Meta vs. o usuário real). Isso é fraude contra os Termos de Uso do Meta (categoria "Cloaking"/Inauthentic Behavior) e o risco real é perder a Business Manager inteira, não só o anúncio. Os itens A2.1/B2 (limpador de metadados) e A2.5/A5.4/B3 (compliance pre-flight checker) resolvem o problema de fundo — taxa de reprovação alta — sem depender de enganar o revisor.

### 6.0 Ordem de execução sugerida

1. **Fundação rápida**: A8.1 (senha hardcoded), A2.1/B2 (limpador de metadados), A1.1 (paginação mobile)
2. **Compliance antes de escalar**: A2.5 + A5.4 / B3 (pre-flight checker)
3. **Crescimento dos painéis atuais**: A1.4 (sentinela de alertas), A3.1 (Ads Library real), A4.1-4.2 (agentes com memória/ações)
4. **Fechar o ciclo de negócio**: A7.1 (webhooks Hotmart/Kiwify), B9 (central financeira)
5. **Apostas grandes**: B1 (ad spy completo), B4 (gerador de criativo IA), B6 (gestão de BMs), B7 (builder + hosting), B8 (PWA)

### Parte A — Melhorias nas funcionalidades existentes

**A1. Mineração de Ofertas** (`server.ts` `/api/scan`, tabela `offer_hits`, `MiningPanel.tsx`, `DashboardPanel.tsx`)
1. Paginação/virtualização da lista — hoje tudo carrega em memória, trava em mobile com volume alto.
2. Filtro de data range real no histórico salvo (hoje só existe "janela de dias" no momento do scan).
3. Screenshot cacheado localmente (hoje só linka pra `urlscan.io/screenshots/{uuid}.png`, nunca baixado).
4. **Sentinela**: cron de scans automáticos recorrentes + notificação (Telegram/WhatsApp/push) quando aparecer rank S novo — equivalente aos alertas de AdSpy/PowerAdSpy.
5. Análise Gemini em lote (hoje só uma oferta por vez, no botão "Eye").
6. Deduplicação por fingerprint de conteúdo, não só URL exata — agrupa páginas-template reaproveitadas entre operações diferentes.
7. Exportação via webhook para Slack/Trello/Notion das ofertas rank S/A.
8. Mobile: lista em cards swipeable, scan em background com push notification quando completar.

**A2. Cofre de Criativos** (`CreativeVault.tsx`, tabela `creatives`, bucket Storage `creatives`)
1. Limpador de metadados (EXIF/GPS/device) + variação de hash perceptual no upload — uso padrão da indústria para evitar que o Facebook trate uploads como cópia idêntica entre testes A/B, sem mexer em moderação de conteúdo.
2. Analytics de performance por criativo — linkar `creatives` ao `ad_id` do Facebook Ads e mostrar CTR/CPA/ROAS direto na vault.
3. Geração automática de variações (crop/cor/overlay de headline) via IA a partir de um criativo vencedor.
4. "Hall da fama" — tag automática de criativo vencedor quando performance cruza um threshold definido.
5. Compliance pre-check no upload (claims de risco, antes/depois proibido) com sugestão de correção de texto sobreposto.
6. Mobile: upload direto de câmera/galeria, fluxo de compressão otimizado para 4G.

**A3. Radar Meta Ads** (`MetaAdsRadar.tsx`, tabelas `radar_categories`/`radar_keywords`)
1. Integração real com a Ads Library (API oficial do Meta) para puxar anúncios ativos por keyword automaticamente, em vez de só organizar palavras manualmente.
2. Tracker de anunciante/Page específica com notificação quando lançar novo criativo — estilo PiPiADS/BigSpy.
3. "Tempo no ar" do anúncio como proxy de performance (quanto mais tempo ativo, mais provável que esteja convertendo).
4. Mobile: keywords organizadas em swipe-deck em vez de kanban horizontal.

**A4. Agentes IA** (`server.ts` `/api/agents/chat`, tabelas `agents`/`chat_sessions`/`chat_messages`)
1. Memória persistente entre sessões — RAG sobre criativos/ofertas/playbooks do próprio operador.
2. Function calling: agente executa ações no sistema (ex: "salve esse ângulo de copy no playbook X", "marque esse criativo como vencedor").
3. Streaming de resposta — melhora bastante a percepção de velocidade em mobile.
4. Novos agentes seed: Auditor de Compliance Meta Ads (revisa copy antes de publicar), Analista de Métricas (lê insights do Facebook Ads e sugere ação).
5. Voice input no mobile.

**A5. Geradores de Copy** (`/api/generate-angles`, `/api/generate-audience-dossier`, `/api/generate-landpage`, `/api/generate-quiz`)
1. Encadear automaticamente dossiê → ângulos → landpage/quiz num fluxo único, reaproveitando contexto entre etapas em vez de gerações isoladas.
2. Preview renderizado + export pronto para colar em Webflow/WordPress/Elementor (hoje só gera JSON + prompt para o AI Studio).
3. Versionamento/histórico de copy gerada, com favoritos.
4. Compliance checker integrado: avisa quando uma claim ("cura", "garantido", "emagreça X kg") tem alto risco de reprovação Meta e sugere reescrita que mantém o apelo persuasivo dentro da política.

**A6. Playbooks** (`PlaybookPanel.tsx`, `RichTextEditor.tsx`, tabela `playbooks`)
1. Templates prontos por categoria (lançamento de oferta, setup de pixel, auditoria de conta banida) como biblioteca inicial.
2. Modo checklist — passos com checkbox e % de conclusão, para rodar o processo e não só lê-lo.
3. Anexar mídia (print de tela, vídeo curto) dentro de um passo.
4. Histórico/versionamento de edição.
5. Mobile: modo "leitura rápida" tipo wizard em tela cheia, ideal para seguir um playbook executando uma tarefa no celular.

**A7. Integrações** (`IntegrationsPanel.tsx`, `useFacebookAuth.ts`, Netlify functions `facebook-*`)
1. Implementar de fato Hotmart/Kiwify (webhooks de venda) para cruzar venda real com criativo/campanha = ROI real por criativo.
2. Health monitor de conta de anúncio: alertas de risco de bloqueio (taxa de reprovação, qualidade de conta).
3. Suporte a múltiplas contas Facebook/Business Managers simultâneas (hoje é uma conta ativa por vez).
4. Webhook outbound para Slack/Telegram/WhatsApp (oferta nova, criativo reprovado, gasto disparou).

**A8. Auth/Config** (`LandingScreen.tsx`)
1. Tirar a senha hardcoded do bundle JS (`adminvusk`/`vusk10` ficam literalmente legíveis no client hoje, visível no F12) — trocar por hash + variável de ambiente.
2. Permitir cadastrar operador sem precisar editar código.
3. Mobile: sessão mais persistente (hoje exige login a cada reload, ruim em PWA/mobile onde abas fecham com frequência).

**A9. Dashboard/Help**
1. Expandir o Dashboard de "ofertas minadas" para uma visão geral do negócio: métricas de Facebook Ads + criativos + ofertas minadas numa tela só (hoje cada painel é isolado).
2. Help como onboarding interativo guiado, em vez de texto estático.

### Parte B — Novas funcionalidades (apostas grandes)

1. **B1 — Ad Spy completo**: evolução do Radar Meta Ads com Ads Library API oficial, histórico de anúncios e tempo no ar por anunciante/nicho.
2. **B2 — Limpador de metadados como serviço reutilizável**: base técnica de A2.1, disponível em qualquer ponto de upload do sistema (vault, agentes, integrações).
3. **B3 — Compliance Pre-Flight Checker central**: analisa copy e criativo contra as políticas públicas do Meta/Google antes de publicar; base de A2.5/A5.4.
4. **B4 — Gerador de criativo com IA**: imagem e roteiro de vídeo UGC a partir do ângulo de copy, para escalar produção sem depender de editor externo.
5. **B5 — Tracking de pixel/UTM server-side próprio**: camada de Conversions API desacoplada do checkout, com atribuição mesmo se a plataforma de pagamento ou o Facebook perderem sinal.
6. **B6 — Gestão de múltiplas Business Managers/contas**: cadastro, monitoramento de saúde e rotação automática quando uma conta cai.
7. **B7 — Builder visual + hosting automatizado**: builder drag-drop com publicação direta via Vercel/Netlify, fechando o ciclo "gerou copy → publicou página" sem saída do sistema.
8. **B8 — PWA instalável**: push notification e modo offline para consulta de playbooks/criativos — mobile-first de verdade.
9. **B9 — Central financeira**: P&L por oferta/criativo/campanha cruzando gasto (Facebook Ads) com receita (Hotmart/Kiwify).
10. **B10 — Banco de ângulos/headlines vencedores cross-oferta**: memória institucional de copy que converteu bem, taggeada por nicho, para reaproveitar entre ofertas novas.
