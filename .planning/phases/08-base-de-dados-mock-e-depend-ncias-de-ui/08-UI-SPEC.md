---
phase: 08
slug: base-de-dados-mock-e-depend-ncias-de-ui
status: draft
shadcn_initialized: false
preset: new-york
created: 2026-04-26
---

# Phase 08 — UI Design Contract

> Contrato visual para adopção de **Tailwind CSS** + **shadcn/ui** sem alterar o contrato HTTP. Migração incremental a partir do CSS existente em `globals.css`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (CLI v4+ — `npx shadcn init`) |
| Preset | `new-york` (preferência; `default` aceitável se CLI sugerir) |
| Component library | Radix UI (via shadcn) |
| Icon library | lucide-react |
| Font | Inter (body), Poppins (títulos) — já usados no projecto |

---

## Spacing Scale

Declarar múltiplos de 4px; alinhar tokens shadcn (`spacing`) quando `components.json` for gerado.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gaps de ícones |
| sm | 8px | Espaçamento compacto |
| md | 16px | Padrão |
| lg | 24px | Secções |
| xl | 32px | Layout |
| 2xl | 48px | Quebras maiores |

Exceptions: nenhuma além das utilidades Tailwind.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px / `text-base` | 400 | 1.5 |
| Label | 14px / `text-sm` | 600 | 1.4 |
| Heading | 20–24px / `text-xl`–`text-2xl` | 700 (Poppins) | 1.25 |
| Display | 26px+ / `text-3xl` | 700 | 1.2 |

---

## Color

Mapear para **CSS variables** (shadcn `cssVariables: true`). Valores iniciais alinhados ao tema actual:

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#ffffff` / `--background` | Fundo |
| Secondary (30%) | `#f9fafb` ou equivalente | Superfícies |
| Accent (10%) | `#10b981` (emerald) | CTAs primários, estados positivos |
| Secondary accent | `#f97316` | Destaques secundários |
| Destructive | `#ef4444` | Cancelar, erros críticos |
| Foreground | `#1f2937` | Texto principal |
| Muted | `#6b7280` | Texto secundário |
| Border | `#d1d5db` | Contornos |

Accent reservado para: **Inscrever**, **Guardar**, confirmações; não usar accent em texto corrido.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Verbo + substantivo (ex.: «Inscrever-me», «Criar partida») |
| Empty state heading | «Ainda não há partidas» (ou equivalente por ecrã) |
| Empty state body | Indicar próximo passo (ex.: «Volta mais tarde ou pede ao organizador») |
| Error state | Mensagem do `error.message` + código quando útil para suporte |
| Destructive confirmation | Nomear ação: «Desinscrever — deixas de estar na fila» |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Button, Card, Input, Label, Select, Dialog (conforme necessidade da migração) | Preferir `npx shadcn add` sem registries de terceiros |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
