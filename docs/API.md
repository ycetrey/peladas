<!-- generated-by: gsd-doc-writer -->

# Referência da API HTTP

Base URL local típica: `http://localhost:3001`. Sem prefixo global (`main.ts` não define `setGlobalPrefix`).

Autenticação: cabeçalho `Authorization: Bearer <access_token>` exceto onde indicado.

## Auth (`auth.controller`)

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| POST | `/auth/login` | — | Corpo `{ "email", "password" }` → token + user |
| GET | `/auth/me` | JWT | Utilizador atual |

## Partidas (`matches.controller`)

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| GET | `/matches` | JWT | Lista partidas visíveis; query `?status=&limit=`; cada `match` inclui **`myRegistration`** |
| GET | `/matches/:id` | JWT | Detalhe; **`myRegistration`** incluído |
| POST | `/matches` | JWT + admin | Criar partida |

## Inscrições (`registrations.controller` — prefixo `matches/:matchId/registrations`)

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| GET | `.../me` | JWT | Inscrição ativa do utilizador ou `null` |
| POST | `...` | JWT | Corpo `{ "preferredPosition" }` — inscrever |
| DELETE | `.../me` | JWT | Cancelar inscrição ativa |

## Equipas (`teams.controller` — `matches`)

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| POST | `/matches/:matchId/teams/generate` | JWT + admin | Gera times A e B |

## Grupos (`groups.controller`)

| Método | Caminho | Auth |
|--------|---------|------|
| GET | `/groups` | JWT |
| POST | `/groups` | JWT |
| POST | `/groups/:id/members` | JWT |
| DELETE | `/groups/:id/members/:userId` | JWT |

## Campos (`venues.controller`)

| Método | Caminho | Auth |
|--------|---------|------|
| GET | `/venues` | JWT |
| GET | `/venues/places/suggest` | JWT |
| POST | `/venues/from-google-place` | JWT |
| POST | `/venues` | JWT |

## Saúde

| Método | Caminho |
|--------|---------|
| GET | `/health` |

## Erros de domínio

Respostas JSON com `{ "error": { "code", "message" } }` (filtro `DomainExceptionFilter`). Códigos úteis: `RegistrationClosedError`, `UserAlreadyRegisteredError`, `MatchNotOpenError`, `NoRegistrationSlotsError`, `MatchNotFoundError`, `InvalidMatchStateError`, `TeamsAlreadyGeneratedError`, `WrongConfirmedCountForTeamsError`, entre outros.
