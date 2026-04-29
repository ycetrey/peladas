import type { Match } from "./types";

/** Janela “urgente”: últimas 2h antes do fecho das inscrições — polling mais frequente. */
const URGENT_BEFORE_CLOSE_MS = 2 * 60 * 60 * 1000;

/** Polling quando há inscrições abertas mas fora da janela urgente. */
const POLL_OPEN_MS = 90_000;

/** Polling quando não há nenhuma partida com inscrições abertas agora (lista pode mudar por novas partidas). */
const POLL_IDLE_MS = 120_000;

/** Detalhe: uma única partida em foco — pode ser um pouco mais reativo. */
const POLL_DETAIL_OPEN_MS = 60_000;
const POLL_DETAIL_URGENT_MS = 25_000;

function nowInRegistrationWindow(m: Match, now: number): boolean {
  if (m.status !== "OPEN") {
    return false;
  }
  const open = new Date(m.registrationOpensAt).getTime();
  const close = new Date(m.registrationClosesAt).getTime();
  return now >= open && now <= close;
}

function isUrgentClosing(m: Match, now: number): boolean {
  if (!nowInRegistrationWindow(m, now)) {
    return false;
  }
  const close = new Date(m.registrationClosesAt).getTime();
  return close - now < URGENT_BEFORE_CLOSE_MS;
}

/**
 * Intervalo em ms para a lista de partidas.
 * O hook `useVisibilityPolling` não executa o callback com o separador em segundo plano.
 */
export function listMatchesPollingIntervalMs(matches: Match[] | null): number | null {
  const now = Date.now();
  if (!matches?.length) {
    return POLL_IDLE_MS;
  }
  let anyOpen = false;
  let anyUrgent = false;
  for (const m of matches) {
    if (!nowInRegistrationWindow(m, now)) {
      continue;
    }
    anyOpen = true;
    if (isUrgentClosing(m, now)) {
      anyUrgent = true;
    }
  }
  if (!anyOpen) {
    return POLL_IDLE_MS;
  }
  return anyUrgent ? POLL_DETAIL_URGENT_MS : POLL_OPEN_MS;
}

/**
 * Intervalo para a página de detalhe de uma partida.
 */
export function matchDetailPollingIntervalMs(match: Match | null): number | null {
  if (!match) {
    return null;
  }
  const now = Date.now();
  if (!nowInRegistrationWindow(match, now)) {
    return POLL_IDLE_MS;
  }
  return isUrgentClosing(match, now) ? POLL_DETAIL_URGENT_MS : POLL_DETAIL_OPEN_MS;
}
