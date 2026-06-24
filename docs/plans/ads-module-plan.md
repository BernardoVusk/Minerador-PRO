# Plano: Módulo "Anúncios" (Tracking + Vendas + ROAS, estilo UTMIFY)

Plano de implementação completo. Ver decisões e raciocínio completo em
`C:\Users\berna\.claude\plans\sleepy-popping-sketch.md` (plano aprovado pelo usuário). Este
arquivo reformata o mesmo plano em tasks numeradas para execução via
subagent-driven-development.

## Global Constraints

Vale para TODAS as tasks abaixo — copie estes valores literalmente, não aproxime:

- **Multi-tenant por convenção:** toda tabela nova tem coluna `operator text not null`.
  Toda query (frontend e backend) sobre essas tabelas DEVE filtrar por `operator` (vindo de
  `useOperator()` / `OperatorContext` no frontend). RLS continua pública
  (`for all using (true) with check (true)`) — não implementar RLS real baseada em
  `auth.uid()`, não existe Supabase Auth configurado.
- **Migrations:** todo SQL novo vai em `supabase/migrations/<timestamp>_<nome>.sql`
  (timestamp formato `YYYYMMDDHHMMSS`, igual aos arquivos existentes em
  `supabase/migrations/`). Depois de criar o arquivo, rodar `npx supabase db push` e mostrar
  o SQL aplicado na resposta do chat (regra 6 do CLAUDE.md). Se o push falhar, avisar e cair
  no fallback manual (colar SQL pro usuário rodar no SQL Editor).
- **Domínio único:** todas as rotas novas de backend vão SÓ em `server.ts` (Express,
  servido em produção via Vercel `api/index.ts`/`dist/server.cjs`). NÃO criar gêmeas em
  `netlify/functions/` para nenhuma rota nova deste plano — Netlify Functions fica restrito
  ao que já existe hoje (rotas Facebook legadas).
- **Segredos:** `capi_access_token` e `webhook_secrets.secret` são sensíveis e nunca devem
  aparecer em nenhuma resposta HTTP (mascarados em qualquer leitura). O client (browser)
  nunca faz `select` direto desses dois campos via Supabase JS — toda leitura/gravação passa
  por rota do `server.ts` que usa a chave do Supabase no backend. **Exceção deliberada:**
  `operator_webhook_tokens.token` É a credencial que vai literalmente na URL do webhook
  (`/api/webhooks/checkout/:platform/:token`) que o usuário cola em cada plataforma de
  checkout — mascará-lo quebraria a funcionalidade (a URL nunca funcionaria). Por isso ele É
  retornado em texto completo por `POST /api/ads/webhook-token` e exibido na aba Vendas; esse
  é o modelo de segurança correto para esse campo (atua como bearer token de URL, não como
  credencial de terceiro igual o token de CAPI).
- **Verificação obrigatória ao final de cada task:** `npx tsc --noEmit -p .` sem erros e
  `npm run build` sem erros novos (os warnings de chunk-size pré-existentes são esperados).
- **Mobile-first:** toda tabela nova precisa de um modo cards no mobile (`< 768px`,
  reaproveitar o breakpoint/padrão já usado em `App.tsx` e `FacebookAdsPanel.tsx`); sub-tabs
  horizontais usam scroll horizontal no mobile, não quebram linha.
- **Estilo visual:** reaproveitar classes utilitárias já existentes no projeto (`mac-card`,
  `surface-base`, `ink-tertiary`, `systemGreen`, etc. — grep em outros componentes do
  diretório `src/components/` para ver o padrão exato) e ícones de `lucide-react`. Não
  introduzir uma nova lib de UI/design system.
- **Commits:** cada task termina com commit próprio (a branch já é `feature/ads-module`,
  criada antes deste plano — não criar branch nova por task).

---

## Task 1: Migration do schema completo do módulo Anúncios

Criar `supabase/migrations/<timestamp>_ads_module.sql` com todas as tabelas abaixo. Usar
exatamente estes nomes de coluna/tipo. Cada tabela leva `enable row level security` +
`create policy "ads public all" on public.<tabela> for all to public using (true) with check (true);`
— mesmo padrão do baseline em `supabase/migrations/20260620161751_baseline_schema.sql` (leia
esse arquivo primeiro para confirmar o estilo exato de migration usado no projeto).

```sql
create table public.ad_accounts (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  fb_account_id text not null,
  name text,
  currency text,
  business_id text,
  status text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (operator, fb_account_id)
);

create table public.ad_insights_daily (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  level text not null check (level in ('account','campaign','adset','ad')),
  fb_account_id text not null,
  fb_entity_id text not null,
  entity_name text,
  date date not null,
  spend numeric(14,2) default 0,
  impressions bigint default 0,
  reach bigint default 0,
  clicks bigint default 0,
  ctr numeric(8,4),
  cpc numeric(12,4),
  cpm numeric(12,4),
  results integer default 0,
  fb_purchase_value numeric(14,2),
  created_at timestamptz not null default now(),
  unique (operator, level, fb_entity_id, date)
);
create index on ad_insights_daily (operator, date);
create index on ad_insights_daily (operator, fb_entity_id, date);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  name text not null,
  ticket_type text check (ticket_type in ('low','high')),
  price numeric(14,2),
  currency text default 'BRL',
  platform text,
  external_product_id text,
  fb_pixel_id text,
  status text default 'active',
  created_at timestamptz not null default now()
);
create index on products (operator);
create index on products (operator, external_product_id);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  platform text not null,
  external_order_id text not null,
  product_id uuid references public.products(id) on delete set null,
  external_product_id text,
  status text not null,
  gross_amount numeric(14,2),
  net_amount numeric(14,2),
  fee_amount numeric(14,2),
  currency text default 'BRL',
  buyer_email text,
  buyer_name text,
  buyer_phone text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  fbclid text,
  src text,
  attributed_campaign_id text,
  attributed_adset_id text,
  attributed_ad_id text,
  attribution_model text,
  occurred_at timestamptz not null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique (operator, platform, external_order_id)
);
create index on sales (operator, occurred_at);
create index on sales (operator, status, occurred_at);
create index on sales (operator, attributed_campaign_id);
create index on sales (operator, product_id);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  sale_id uuid not null references public.sales(id) on delete cascade,
  external_product_id text,
  product_id uuid references public.products(id) on delete set null,
  name text,
  amount numeric(14,2),
  quantity integer default 1,
  created_at timestamptz not null default now()
);
create index on sale_items (operator, sale_id);

create table public.funnels (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  name text not null,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.funnel_steps (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  name text not null,
  event_name text,
  step_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index on funnel_steps (operator, funnel_id, step_order);

create table public.pixels (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  name text,
  fb_pixel_id text not null,
  fb_account_id text,
  status text default 'unknown',
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  unique (operator, fb_pixel_id)
);

create table public.capi_configs (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  pixel_id uuid references public.pixels(id) on delete cascade,
  fb_pixel_id text not null,
  capi_access_token text not null,
  test_event_code text,
  event_map jsonb default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  event_id text,
  event_name text not null,
  source text not null,
  fb_pixel_id text,
  url text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  fbclid text, fbp text, fbc text,
  client_ip text, user_agent text,
  email_hash text,
  value numeric(14,2), currency text,
  sale_id uuid references public.sales(id) on delete set null,
  capi_sent boolean default false,
  capi_response jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on tracking_events (operator, occurred_at);
create index on tracking_events (operator, event_name, occurred_at);
create index on tracking_events (operator, event_id);

create table public.operator_webhook_tokens (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  token text not null unique,
  created_at timestamptz not null default now()
);

create table public.webhook_secrets (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  platform text not null,
  secret text not null,
  created_at timestamptz not null default now(),
  unique (operator, platform)
);

create table public.webhook_events_raw (
  id uuid primary key default gen_random_uuid(),
  operator text,
  platform text,
  headers jsonb,
  body jsonb,
  signature_valid boolean,
  processed boolean default false,
  error text,
  created_at timestamptz not null default now()
);
create index on webhook_events_raw (platform, created_at);
```

Aplique RLS (enable + a policy pública mostrada nos Global Constraints) em cada uma das 13
tabelas acima. Depois de escrever o arquivo, execute `npx supabase db push`. Reporte o SQL
final aplicado no seu relatório de task (o controller vai mostrá-lo ao usuário).

**Não crie** nenhum componente ou rota nesta task — só a migration.

---

## Task 2: Instalar Recharts

Rodar `npm install recharts`. Confirmar que `npm run build` continua passando depois de
instalar (a dependência não precisa ser usada ainda — só instalada e disponível para as
tasks de Dashboard/Analytics/Funis mais adiante). Não escrever nenhum componente nesta task.

---

## Task 3: Shell do módulo "Anúncios" + wiring na navegação

Depende da Task 1 só para existir o schema (não usa ainda nesta task). Não depende da Task 2.

1. Criar `src/components/ads/AdsModule.tsx`: componente que renderiza um sub-shell com
   sub-tabs internas via estado local `adsSubTab` (NÃO adicionar essas 13 sub-abas à union
   `activeTab` de `App.tsx` — só "ads" entra lá). Por enquanto, cada sub-tab pode renderizar
   um placeholder `<div>Em construção</div>` — os componentes reais vêm nas tasks seguintes;
   deixe import comentado ou um mapa `{ id: string; label: string; render: () => JSX }` fácil
   de completar depois. Agrupe visualmente as sub-tabs em 3 grupos, nesta ordem: **Visão**
   (Dashboard, Analytics) · **Meta** (Campanhas, Conjuntos, Anúncios, Pixels, Contas de Ads,
   Meta CAPI) · **Vendas** (Vendas, Produtos, Funis, Atribuição, Eventos). Sub-tabs em
   scroll horizontal no mobile (siga o padrão de tabs do projeto, olhe como o drawer mobile
   de `src/App.tsx` lida com isso).
2. Em `src/App.tsx`:
   - Adicionar `"ads"` à union de `activeTab` (linha ~195).
   - Adicionar um botão "Anúncios" (ícone `Megaphone` de `lucide-react`) no grupo "Tráfego
     Pago" da sidebar desktop, próximo de onde estão os botões "Cofre Criativos"/"Radar Meta
     Ads" (linhas ~339-365 — leia o trecho exato antes de editar para copiar o padrão de
     classes/estrutura JSX usado nos outros botões do mesmo grupo).
   - Adicionar a mesma entrada `{ id: "ads", label: "Anúncios", icon: Megaphone }` no array
     usado pelo drawer mobile do grupo "Tráfego Pago" (linhas ~609-612 — é um array
     duplicado do mesmo grupo, separado da sidebar desktop; os dois precisam ser editados).
   - Adicionar `{activeTab === "ads" && <AdsModule />}` junto dos outros `{activeTab === ... && <Componente />}` (perto da linha ~799), e o `import` do componente no topo do arquivo.

Verificar manualmente: abrir o app, clicar em "Anúncios" no grupo "Tráfego Pago" (desktop e
no drawer mobile/viewport estreita), confirmar que o shell aparece com as 13 sub-abas
navegáveis (mesmo que vazias).

---

## Task 4: Hook `useAdsData` + geração de token de webhook por operador

Depende da Task 1 (schema já precisa existir).

1. Criar `src/hooks/useAdsData.ts`: hook que recebe o operador atual (via
   `useOperator()`, mesmo padrão de `src/hooks/useFacebookAuth.ts`) e expõe helpers que já
   filtram por `operator` nas queries Supabase, por exemplo `listProducts()`, `listSales()`,
   etc. — implemente pelo menos os helpers genéricos de leitura/escrita que as tasks
   seguintes vão precisar (consulte `src/lib/supabase.ts` para o client já configurado).
   Não precisa cobrir toda tabela agora — adicione os helpers conforme as tasks de UI forem
   precisando, mas deixe a estrutura (ex: `function useAdsTable<T>(table: string)`) pronta
   para reuso.
2. Em `server.ts`, criar rota `POST /api/ads/webhook-token` que recebe `{ operator }` no
   body, faz upsert em `operator_webhook_tokens` (gera um token aleatório via
   `crypto.randomBytes(24).toString('hex')` se não existir um para aquele operador ainda,
   senão retorna o existente) e responde `{ token }`. Essa rota será chamada pela aba
   "Vendas" ou "Pixels" mais adiante para o usuário descobrir a URL do seu webhook — não
   precisa de UI nesta task, só a rota.

---

## Task 5: Aba "Contas de Ads" — multi-conta Facebook

Depende das Tasks 1, 3, 4.

1. Criar `src/components/ads/AdsAccounts.tsx`. Ao montar, chama a rota já existente
   `GET /api/facebook/ad-accounts?accessToken=...` (mesma usada em
   `src/components/FacebookAdsPanel.tsx` — reaproveite o padrão de fetch/loading/erro de lá)
   usando o token salvo pelo `useFacebookAuth()`.
2. Para cada conta retornada, fazer upsert em `public.ad_accounts` (`operator`,
   `fb_account_id`, `name`, `currency`, `business_id`, `status`) via Supabase client direto
   do frontend (`onConflict: 'operator,fb_account_id'`).
3. UI: lista de contas com nome, moeda, status; botão "Definir como padrão" que seta
   `is_default = true` nela e `false` nas demais do mesmo operador (`is_default` decide qual
   conta as outras sub-abas de Meta usam por padrão quando não há seleção explícita).
4. Tabela no desktop, cards no mobile.

---

## Task 6: Aba "Campanhas" com escrita (ativar/pausar/budget)

Depende da Task 3. Reaproveita lógica de `src/components/FacebookAdsPanel.tsx` (a parte que
busca campanhas via `GET /api/facebook/campaigns?accessToken=...&adAccountId=...`).

1. Criar `src/components/ads/AdsCampaigns.tsx`: extraia/replique o padrão de tabela com
   busca, filtro de status (ACTIVE/PAUSED), ordenação por gasto/CTR/resultados, já usado em
   `FacebookAdsPanel.tsx` para campanhas, num componente próprio (não precisa herdar de
   `FacebookAdsPanel.tsx`, pode duplicar a lógica relevante — esse componente vai virar o
   lugar definitivo de gestão de campanhas).
2. Em `server.ts`, adicionar duas rotas novas:
   - `POST /api/facebook/campaign/:id/status` — body `{ accessToken, status }` (`status`
     é `'ACTIVE'` ou `'PAUSED'`), chama a Graph API
     `POST https://graph.facebook.com/v19.0/{campaign_id}?status={status}&access_token={token}`.
   - `POST /api/facebook/campaign/:id/budget` — body `{ accessToken, dailyBudget }`
     (em centavos, como a Graph API espera), chama
     `POST https://graph.facebook.com/v19.0/{campaign_id}?daily_budget={valor}&access_token={token}`.
   Ambas retornam `{ success: true }` ou `{ success: false, error }`.
3. Na UI, adicionar toggle de ativar/pausar por linha (chama a rota de status) e campo de
   edição inline de budget diário (chama a rota de budget) — com confirmação (modal/confirm)
   antes de aplicar, já que é uma escrita real na conta de anúncios do usuário.

---

## Task 7: Aba "Conjuntos" (ad sets) com escrita

Depende da Task 6 (mesmo padrão, nível adset). Reaproveita
`GET /api/facebook/adsets?accessToken=...&campaignId=...` já existente.

1. Criar `src/components/ads/AdsAdSets.tsx`, mesmo padrão de tabela/filtro/sort de ad sets
   já usado em `FacebookAdsPanel.tsx` (busca por campanha).
2. Rotas novas em `server.ts`: `POST /api/facebook/adset/:id/status` e
   `POST /api/facebook/adset/:id/budget`, mesma lógica da Task 6 mas no endpoint de adset da
   Graph API.
3. Mesma UI de toggle status + edição de budget inline com confirmação.

---

## Task 8: Aba "Anúncios" (nível ad — novo, não existe hoje)

Depende da Task 7.

1. Em `server.ts`, criar `GET /api/facebook/ads?accessToken=...&adsetId=...` que busca na
   Graph API `GET /{adset_id}/ads?fields=id,name,status,creative{thumbnail_url,body,title},insights{spend,impressions,clicks,ctr,actions}&access_token=...` e retorna `{ success: true, ads: [...] }`.
2. Criar `POST /api/facebook/ad/:id/status` (mesmo padrão das tasks 6/7, nível ad).
3. Criar `src/components/ads/AdsAds.tsx`: lista de anúncios com thumbnail do criativo,
   nome, status, métricas básicas (spend/impressions/clicks/ctr), toggle ativar/pausar.
   Mobile: cards com a thumbnail em destaque.

---

## Task 9: Sincronização de insights diários (`ad_insights_daily`)

Depende das Tasks 1, 5, 6.

1. Em `server.ts`, criar `POST /api/ads/sync-insights` — body `{ accessToken, fbAccountId, operator }`.
   Para os 4 níveis (`account`, `campaign`, `adset`, `ad`), busca os insights do dia atual
   (ou do preset `today`/`yesterday`, decida o que for mais simples de implementar
   corretamente) via Graph API (reaproveite os endpoints já existentes de insights de
   `server.ts` como referência de parsing de `actions[]` para extrair `results` e
   `fb_purchase_value`) e faz upsert em `public.ad_insights_daily`
   (`onConflict: 'operator,level,fb_entity_id,date'`).
2. Adicionar um botão "Sincronizar agora" em algum lugar visível do módulo (pode ser no
   `AdsModule.tsx`, no topo, fora das sub-tabs) que chama essa rota manualmente — não é
   necessário cron/agendamento nesta task (isso fica para uma melhoria futura, fora deste
   plano).
3. Reportar quantas linhas foram upsertadas como parte do retorno da rota, para feedback na UI.

---

## Task 10: Aba "Produtos" (CRUD)

Depende da Task 1.

1. Criar `src/components/ads/AdsProducts.tsx`: CRUD completo via Supabase client direto
   (sem rota de backend nova — filtra sempre por `operator`). Campos do formulário: `name`,
   `ticket_type` (`low`/`high`), `price`, `currency` (default `BRL`), `platform` (select:
   Hotmart/Kiwify/Wiapy/Lowify/Outro), `external_product_id`, `fb_pixel_id`, `status`.
2. UI: grid ou tabela com ações de editar/excluir, modal/form de criação. Mobile: cards.

---

## Task 11: Webhooks de checkout — Hotmart + Kiwify (adapter real) + rota + persistência de vendas

Depende das Tasks 1, 10. Esta é a task mais sensível do plano — leia com atenção.

1. Criar `server/adapters/checkout/` com:
   - `types.ts`: interface `NormalizedSale { externalOrderId: string; externalProductId?: string; status: string; grossAmount?: number; netAmount?: number; feeAmount?: number; currency?: string; buyer: { email?: string; name?: string; phone?: string }; utm: { source?: string; medium?: string; campaign?: string; content?: string; term?: string }; fbclid?: string; src?: string; items: { externalProductId?: string; name?: string; amount?: number; quantity?: number }[]; occurredAt: string; }` e a interface do adapter `{ verifySignature(req): boolean; parse(body): NormalizedSale | null }`.
   - `hotmart.ts`: `verifySignature` valida o campo `hottok` presente no payload contra o
     secret salvo em `webhook_secrets` (platform `'hotmart'`) daquele operador. `parse` mapeia
     `data.purchase.transaction` → `externalOrderId`, `data.purchase.status` → `status`
     (normalizar valores tipo `APPROVED`/`COMPLETE` → `'approved'`, `REFUNDED` → `'refunded'`,
     etc.), `data.purchase.price.value` → `grossAmount`, `data.buyer.email/name/phone`,
     `data.product.id` → `externalProductId`, `data.purchase.order_date` → `occurredAt`. Se
     a Hotmart mandar UTMs/`src`/`sck` em algum campo do payload, mapear também — documente
     no código quais campos você confirmou vs. assumiu por inferência (não tenho a doc
     oficial aberta agora; se o formato divergir na prática, o `webhook_events_raw` guarda o
     raw para ajuste posterior).
   - `kiwify.ts`: `verifySignature` calcula HMAC-SHA1 do raw body usando o secret salvo em
     `webhook_secrets` (`platform = 'kiwify'`) e compara com o `?signature=` da query string
     da requisição. `parse` mapeia os campos equivalentes do payload Kiwify (status de
     pedido, valores, comprador, produto, UTMs) seguindo a mesma `NormalizedSale`.
   - `index.ts`: registry `{ hotmart, kiwify }` (Wiapy/Lowify entram na Task 12).
2. Em `server.ts`:
   - Adicionar um middleware de captura de raw body **só** no path de webhook (precisa vir
     antes do `express.json({limit:"15mb"})` global já existente, ou usar a opção `verify`
     do `express.json` para popular `req.rawBody` — escolha a abordagem que exigir menos
     mudança estrutural no arquivo, mas confirme que o `express.json` global continua
     funcionando normalmente para todas as outras rotas depois da mudança).
   - Criar `POST /api/webhooks/checkout/:platform/:operatorToken`:
     a. Resolve `operator` via `operator_webhook_tokens.token = :operatorToken` (404 se não
        achar).
     b. Sempre grava uma linha em `webhook_events_raw` com `operator`, `platform`, headers,
        body bruto, antes de processar (auditoria, mesmo se o parse falhar depois).
     c. Busca o adapter do registry pelo `:platform` da URL; se não existir, responde 400.
     d. Chama `verifySignature`; se falsa, marca `webhook_events_raw.signature_valid=false`,
        responde 401, não processa a venda.
     e. Chama `parse(body)`; se `null`, marca `processed=false, error='unparsed'`, responde
        200 (não falhar o webhook por isso — a plataforma reenvia se você responder erro).
     f. Faz upsert em `public.sales` (`onConflict: 'operator,platform,external_order_id'`)
        com os campos do `NormalizedSale`, e tenta resolver `product_id` via
        `external_product_id` contra `public.products` daquele operador.
     g. Insere `sale_items` vinculados ao `sale_id`.
     h. Marca `webhook_events_raw.processed = true`.
   - **Não** disparar CAPI nesta task — isso é a Task 16, que vai voltar a editar este
     handler para acrescentar o passo de envio.
3. Adicionar rota simples `POST /api/ads/webhook-secret` (`{ operator, platform, secret }`)
   para o usuário cadastrar o secret de cada plataforma (upsert em `webhook_secrets`,
   `onConflict: 'operator,platform'`) — sem UI ainda, a aba que usa isso vem na Task 13.
4. Teste manual: simular um payload Hotmart e um Kiwify reais (ou o mais realista possível)
   via curl/Postman contra o servidor local e confirmar que cai uma linha correta em `sales`.

---

## Task 12: Adapters Wiapy/Lowify (stub explícito de descoberta)

Depende da Task 11.

1. Criar `server/adapters/checkout/wiapy.ts` e `lowify.ts`. Cada um exporta
   `verifySignature` que **sempre retorna `true`** mas loga um aviso explícito
   (`console.warn`) dizendo que a assinatura não está sendo validada porque o formato de
   segurança da plataforma ainda não foi confirmado. `parse` **sempre retorna `null`** —
   não invente o formato do payload. Adicione um comentário no topo de cada arquivo:
   `// TODO: formato de payload não confirmado — confirmar com a doc oficial da Wiapy/Lowify
   // antes de implementar o parse real. Até então, todo evento cai em webhook_events_raw
   // com processed=false para inspeção manual.`
2. Registrar os dois no `index.ts` do Task 11 (`{ hotmart, kiwify, wiapy, lowify }`).
3. Confirme que o pipeline da Task 11 já trata corretamente `parse` retornando `null`
   (marca `processed=false, error='unparsed'`, responde 200) — não deveria precisar mudar
   nada no handler, só registrar os dois novos adapters.

---

## Task 13: Aba "Vendas"

Depende das Tasks 1, 10, 11, 12.

1. Criar `src/components/ads/AdsSales.tsx`: tabela lendo `public.sales` (+ join simples com
   `products` para mostrar nome do produto) filtrado por `operator`, com colunas: data
   (`occurred_at`), produto, valor bruto/líquido, status (badge colorido: approved=verde,
   refunded/chargeback=vermelho, pending=amarelo), plataforma, comprador, UTM/campanha
   (`utm_campaign`). Filtros: status, plataforma, período (date range), produto. Paginação
   ou virtualização se a lista crescer (reaproveite o padrão de paginação se já existir em
   algum outro painel, ex. `DashboardPanel.tsx`).
2. Incluir, no topo da aba, a seção de configuração que faltou nas tasks anteriores: botão
   "Gerar/copiar URL do meu webhook" (chama `POST /api/ads/webhook-token` da Task 4 e monta
   a URL completa `https://<dominio-vercel>/api/webhooks/checkout/{platform}/{token}` para
   cada uma das 4 plataformas) e um form para cadastrar o secret de cada plataforma (chama
   `POST /api/ads/webhook-secret` da Task 11).
3. Mobile: cards.

---

## Task 14: Tabela `pixels` (já criada na Task 1) + Aba "Pixels"

Depende das Tasks 1, 3.

1. Criar `src/components/ads/AdsPixels.tsx`: CRUD de `public.pixels` (campos `name`,
   `fb_pixel_id`, `fb_account_id`) via Supabase direto, filtrado por `operator`.
2. Gerador de snippet: dado um pixel selecionado, gerar um bloco de código JS para copiar
   (botão "Copiar"), contendo: o pixel base do Meta (`fbq('init', ...)`, `fbq('track',
   'PageView')`), captura de parâmetros UTM da URL atual e dos cookies `_fbp`/`_fbc`, geração
   de um `event_id` (`crypto.randomUUID()` ou equivalente client-safe) e uma chamada
   `fetch('/api/track/collect', { method: 'POST', body: JSON.stringify({...}) })` — a rota
   `/api/track/collect` em si é construída na Task 16, então o snippet pode referenciá-la
   desde já (ela vai existir quando o usuário efetivamente colar e usar o snippet).
3. Abaixo do snippet, mostrar um checklist estático (texto/lista, não funcional) lembrando
   onde colar o mesmo `fb_pixel_id` nativamente: configurações de pixel da Hotmart, Kiwify,
   Wiapy e Lowify — isso é só orientação, não chama nenhuma API dessas plataformas.
4. Coluna de status (`pixels.status`, `last_event_at`) — pode ficar `'unknown'` por agora,
   ela é atualizada de fato só na Task 16/17 quando eventos passam a chegar.

---

## Task 15: Tabela `capi_configs` (já criada na Task 1) + Aba "Meta CAPI"

Depende das Tasks 1, 14.

1. Criar `src/components/ads/AdsCapi.tsx`: form de CRUD de `public.capi_configs` vinculado a
   um `pixel_id` (select dos pixels cadastrados na Task 14) — campos `capi_access_token`
   (input tipo password/mascarado na UI), `test_event_code`, `event_map` (editor simples
   tipo key-value: nome de evento interno → nome de evento Meta, ex.
   `purchase_webhook -> Purchase`), `is_active` (toggle).
2. Em `server.ts`, criar:
   - `POST /api/ads/capi/config` — upsert em `capi_configs` (o client NUNCA lê
     `capi_access_token` de volta depois de salvo — ao recarregar a lista, mascare o token,
     ex. retorne só os últimos 4 caracteres).
   - `POST /api/ads/capi/test` — body `{ capiConfigId }`; busca a config, monta um evento de
     teste simples (`event_name: 'TestEvent'` ou um Purchase fake pequeno) com
     `test_event_code`, envia para
     `POST https://graph.facebook.com/v19.0/{fb_pixel_id}/events?access_token={token}` e
     retorna a resposta da Graph API pro botão "Enviar evento de teste" da UI mostrar
     sucesso/erro.
3. Documentar na própria UI (texto pequeno, não precisa ser modal) o risco de
   double-counting: já que a plataforma de checkout pode enviar Purchase nativamente via o
   mesmo Pixel ID, o Meta pode eventualmente registrar esse evento duas vezes — é uma
   limitação conhecida e aceita do modelo (mesmo trade-off de ferramentas como a UTMIFY).

---

## Task 16: Coleta de eventos client-side + disparo de CAPI Purchase no webhook de venda

Depende das Tasks 11, 14, 15. Esta task volta a tocar o handler de webhook da Task 11 —
leia o código atual dele antes de editar.

1. Criar `POST /api/track/collect` em `server.ts`: recebe
   `{ event_id, event_name, fb_pixel_id, url, utm_source, utm_medium, utm_campaign,
   utm_content, utm_term, fbclid, fbp, fbc, value, currency, email? }` do snippet (Task 14),
   captura `client_ip` (do header `x-forwarded-for` ou `req.ip`) e `user_agent` (header) no
   próprio servidor, faz `email_hash` (SHA256, se `email` vier) e insere em
   `public.tracking_events` com `source = 'pixel'`. Se existir uma `capi_configs` ativa para
   aquele `fb_pixel_id`, encaminha o mesmo evento para a Graph API CAPI usando o **mesmo**
   `event_id` recebido (dedup nativo do Meta entre pixel client-side e CAPI), grava
   `capi_sent`/`capi_response` na mesma linha.
2. Editar o handler `POST /api/webhooks/checkout/:platform/:operatorToken` (Task 11): depois
   do passo "marca `webhook_events_raw.processed = true`", se `status === 'approved'` (ou
   equivalente normalizado) e existir uma `capi_configs` ativa vinculada ao
   `product_id`/`fb_pixel_id` daquela venda, montar e enviar um evento `Purchase` via CAPI:
   `event_id` = hash determinístico de `external_order_id` (ex.
   `sha256(platform + ':' + externalOrderId)`), `user_data.em` = `email_hash` do comprador,
   `fbc`/`fbp` se algum `tracking_event` anterior daquele mesmo `fbclid`/email puder ser
   casado (busca simples por `fbclid` ou `email_hash` recente em `tracking_events` daquele
   operador, sem precisar de modelo de atribuição completo ainda — isso é só pra enriquecer
   o evento CAPI, a atribuição "de verdade" é a Task 18), `custom_data.value`/`currency` da
   venda. Inserir uma linha em `tracking_events` com `source = 'webhook'`, `sale_id`
   preenchido, e o resultado do envio (`capi_sent`, `capi_response`).
3. Atualizar `pixels.last_event_at`/`status` (Task 14) quando um evento chega para aquele
   `fb_pixel_id` (qualquer fonte, pixel ou webhook).

---

## Task 17: Aba "Eventos"

Depende da Task 16.

1. Criar `src/components/ads/AdsEvents.tsx`: feed cronológico (mais recente primeiro) de
   `public.tracking_events` filtrado por `operator`. Colunas/cards: `occurred_at`,
   `event_name`, `source` (badge pixel/capi/webhook), `value`/`currency` se houver, badge de
   `capi_sent` (verde se true, vermelho com tooltip do erro em `capi_response` se false e
   havia uma config ativa esperada). Filtros: `event_name`, `source`, período.
2. Mobile: cards.

---

## Task 18: Atribuição (recompute) + Aba "Atribuição"

Depende das Tasks 9, 13, 16.

1. Criar `POST /api/ads/attribution/recompute` em `server.ts` (body `{ operator }`): para
   cada linha de `sales` daquele operador ainda sem `attributed_campaign_id`, tenta casar
   por (a) `fbclid` da venda contra `tracking_events.fbclid` mais recente antes de
   `occurred_at` daquela venda que tenha `utm_campaign`/algum identificador de
   campanha — como a Graph API não devolve facilmente "campanha a partir de um fbclid" sem
   parsing do próprio `fbclid` (que contém o `ad_id` codificado em alguns casos) ou sem ter
   persistido qual anúncio gerou aquele clique, **documente claramente no código que o
   modelo de atribuição real é `utm_campaign`/`utm_content` como chave primária** (o
   operador deve nomear suas campanhas/conjuntos/anúncios do Facebook com UTMs
   correspondentes, ou usar os parâmetros de UTM dinâmicos do próprio Facebook
   `?utm_campaign={{campaign.name}}&utm_content={{ad.id}}` na URL de destino dos anúncios —
   sugestão a expor como texto de ajuda na aba). Casamento por `fbclid` puro fica como
   fallback best-effort (registra o `fbclid` mas só preenche `attributed_ad_id` se você
   conseguir extrair o `ad_id` do formato do `fbclid`, senão deixa em branco). Atualiza
   `sales.attributed_campaign_id/adset_id/ad_id` e `attribution_model` (`'utm'` ou
   `'fbclid'` ou `'none'`).
2. Criar `src/components/ads/AdsAttribution.tsx`: tabela cruzando `sales.attributed_*` com
   `ad_insights_daily` (mesmo `fb_entity_id`) para mostrar, por campanha/conjunto/anúncio:
   gasto total, receita atribuída, ROI/ROAS. Botão "Recalcular atribuição" chama a rota
   acima. Vendas sem atribuição aparecem numa seção separada ("não atribuídas").

---

## Task 19: Funis (`funnels`/`funnel_steps`) + Aba "Funis"

Depende das Tasks 1, 16.

1. Criar `GET /api/ads/funnel/:id/stats` em `server.ts`: para cada `funnel_step` (ordenado
   por `step_order`), conta quantos `tracking_events` daquele operador têm
   `event_name = funnel_steps.event_name` no período pedido (query param `from`/`to`),
   retornando a contagem por etapa (para calcular drop-off no frontend: etapa N / etapa 1).
2. Criar `src/components/ads/AdsFunnels.tsx`: CRUD de `funnels` (Supabase direto) e editor
   de `funnel_steps` dentro de cada funil (nome, `event_name` — select dos `event_name`
   distintos já vistos em `tracking_events` daquele operador, mais opção de digitar um novo
   —, reordenação simples via botões subir/dessubir, sem precisar de drag-and-drop). Abaixo
   do editor, visualização do funil (barras horizontais proporcionais ao volume de cada
   etapa, com % de drop-off em relação à etapa anterior) usando os dados de
   `/api/ads/funnel/:id/stats`.

---

## Task 20: Aba "Dashboard"

Depende das Tasks 9, 13, 18 (precisa de `ad_insights_daily` e `sales` com dados reais para
fazer sentido, mas a tela deve renderizar corretamente mesmo com tabelas vazias — sem
crashar, mostrando estado vazio).

1. Criar `GET /api/ads/dashboard?operator=...&from=...&to=...` em `server.ts`: agrega por
   dia, no período pedido, `sum(ad_insights_daily.spend)` (nível `account`, para não somar
   duplicado entre account/campaign/adset/ad do mesmo gasto) e `sum(sales.gross_amount)`
   onde `status='approved'`, retornando uma série temporal `[{ date, spend, revenue }]` mais
   os totais agregados do período: receita total, gasto total, ROAS (`revenue/spend`), AOV
   (`revenue/count(sales)`), lucro (`net_amount` somado), número de vendas.
2. Criar `src/components/ads/AdsDashboard.tsx`: cards de KPI no topo (Receita, Gasto, ROAS,
   AOV, Lucro, Nº vendas) + gráficos Recharts (instalado na Task 2): um `LineChart`
   Receita×Gasto no tempo, um `AreaChart` de ROAS, um `BarChart` de receita por produto (via
   `sales` agrupado por `product_id`, pode ser uma segunda chamada simples ou parte da
   mesma rota — decida o que for mais simples sem duplicar lógica). Seletor de período
   (ex: 7/14/30 dias, custom range).
3. Tratar estado vazio (sem `ad_insights_daily`/`sales` ainda) mostrando zeros/gráficos
   vazios sem erro.

---

## Task 21: Aba "Analytics"

Depende da Task 20 (reaproveita a mesma rota de agregação como base).

1. Criar `GET /api/ads/analytics?operator=...&periodA_from&periodA_to&periodB_from&periodB_to`
   em `server.ts`: roda a mesma agregação da Task 20 para dois períodos e retorna os dois
   conjuntos de totais lado a lado, mais um breakdown por `utm_campaign` (receita e nº de
   vendas agrupado por `sales.utm_campaign`) e um funil simples PageView→Purchase usando
   `tracking_events` (contagem de `event_name IN ('PageView','InitiateCheckout','Purchase')`
   no período).
2. Criar `src/components/ads/AdsAnalytics.tsx`: seletor de dois períodos para comparação,
   cards mostrando a variação % entre período A e B (receita, gasto, ROAS, nº vendas),
   tabela de breakdown por UTM campaign, e um funil visual simples (mesma técnica de barras
   da Task 19) para PageView→InitiateCheckout→Purchase.

---

## Ordem de execução

Sequencial por dependência declarada em cada task (não paralelizar implementadores — a
skill subagent-driven-development já proíbe isso por padrão). Ordem recomendada: 1 → 2 → 3
→ 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 → 21.
