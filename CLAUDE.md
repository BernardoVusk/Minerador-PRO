# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 0. Contexto do Projeto

Vusk Operation é um **Sistema de organização e gestão das minhas operações de trafego pago, low tichet, high ticket, criação de ofertas, criação de paginas de vendas etc... é um sistema para uso proprio onde anoto tudo que eu sei como se fosse um segundo cerebro meu.**  Stack decidida (ver `PLANEJAMENTO.md` para o detalhamento arquitetural completo):


`PLANEJAMENTO.md` é a fonte de verdade para decisões de arquitetura, schema e fases de lançamento.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Version Control (always)

This project is versioned in git and pushed to the GitHub repo `VuskOperation` (owner: BernardoVusk).

- After every meaningful update to the project, commit the changes with a clear message describing what changed.
- Push commits to the GitHub remote so history is preserved off-machine.
- Never use destructive history rewrites (`reset --hard`, `force push`, `amend` on pushed commits) without explicit confirmation — the whole point of this is to let the user roll back to a previous version if something breaks.
- To roll back: use `git log` to find the desired commit and `git checkout <commit> -- <path>` or `git revert` rather than discarding history.

## 6. Mudanças de Banco de Dados (Supabase)

Toda vez que uma tarefa de código exigir mudança de schema (nova tabela, coluna, policy RLS, função, etc.):

1. Criar o arquivo de migration versionado em `supabase/migrations/`.
2. Aplicar essa migration automaticamente no projeto Supabase já linkado, rodando `npx supabase db push` — não pedir para o usuário colar SQL manualmente no Studio.
3. Sempre mostrar o SQL aplicado na resposta do chat, mesmo com o push já feito automaticamente — para transparência/auditoria.
4. Se o push falhar (CLI não logada/linkada, sem rede, etc.), avisar explicitamente e cair de volta para o fluxo manual: colar o SQL para o usuário rodar no SQL Editor do Supabase.

Pré-requisito (passo único e manual do usuário, não automatizável): `npx supabase login` + `npx supabase link --project-ref <ref>`. Sem isso, o passo 2 sempre cai no fallback do passo 4.
