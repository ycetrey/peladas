---
phase: 05-app-next-js-jogador
slug: 05-app-next-js-jogador
date: 2026-04-23
---

# Phase 5 — Validation Strategy (Nyquist-lite)

## Dimensions

| # | Dimension | How verified |
|---|-------------|----------------|
| 1 | Functional (UIJ) | UAT: list → detail → register → see status → cancel → see updated status |
| 2 | Build | `pnpm --filter @peladas/web-jogador run build` exits 0 |
| 3 | API contract | Manual: 400 responses show `error.code` from API |
| 4 | Security smoke | CORS only allowed origins; no echo of player UUID in URL query where avoidable |

## UAT checklist (manual)

1. Com API + DB + seed, abrir `http://localhost:3002`.  
2. Definir UUID de jogador seed no painel; guardar.  
3. Ver ≥1 partida na lista.  
4. Abrir detalhe; inscrever; ver titular ou reserva.  
5. Cancelar; ver cancelado ou titular após promoção (conforme API).  

---

*Phase: 05-app-next-js-jogador*
