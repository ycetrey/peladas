"use client";

import Link from "next/link";
import { createContext, useContext, useMemo, useState } from "react";
import {
  cancelMyRegistration,
  clearMyAbsence,
  markMyAbsence,
  registerForMatch,
} from "../../lib/api";
import { mapPlayerApiError } from "../../lib/map-api-error";
import { matchModeLabelPt } from "../../lib/match-mode";
import type { Match, Registration } from "../../lib/types";

const MatchCardContext = createContext<Match | null>(null);

function useMatch(): Match {
  const m = useContext(MatchCardContext);
  if (!m) {
    throw new Error("MatchCard parts must be used inside MatchCard.Root");
  }
  return m;
}

function Root({ match, children }: { match: Match; children: React.ReactNode }) {
  const value = useMemo(() => match, [match]);
  return <MatchCardContext.Provider value={value}>{children}</MatchCardContext.Provider>;
}

Root.displayName = "MatchCard.Root";

function Title() {
  const m = useMatch();
  return <strong>{m.title}</strong>;
}

Title.displayName = "MatchCard.Title";

function Subtitle({
  formatDateTime,
}: {
  formatDateTime: (iso: string) => string;
}) {
  const m = useMatch();
  const loc = m.venue.locality
    ? `${m.venue.name} · ${m.venue.locality}`
    : m.venue.name;
  return (
    <div className="muted" style={{ fontSize: "0.9rem" }}>
      {loc} · {formatDateTime(m.dateTime)}
    </div>
  );
}

Subtitle.displayName = "MatchCard.Subtitle";

function SlotsLine() {
  const m = useMatch();
  const n = m.titularSlotsRemaining;
  const label =
    n <= 0 ? "Titulares: lotado" : `Vagas de titular: ${n}`;
  return (
    <div className="muted" style={{ fontSize: "0.85rem" }}>
      {label}
      {m.visibility === "GROUP" ? (
        <span>
          {" "}
          · <span className="badge">Grupo</span>
        </span>
      ) : null}
    </div>
  );
}

SlotsLine.displayName = "MatchCard.SlotsLine";

function Meta({ formatDateTime }: { formatDateTime: (iso: string) => string }) {
  const m = useMatch();
  return (
    <div className="muted">
      {formatDateTime(m.dateTime)} · {matchModeLabelPt(m.mode)} ·{" "}
      <span className="badge">{m.status}</span>
    </div>
  );
}

Meta.displayName = "MatchCard.Meta";

function formatDateTimeDefault(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-PT", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function LinkRow({ formatDateTime }: { formatDateTime?: (iso: string) => string }) {
  const m = useMatch();
  const fmt = formatDateTime ?? formatDateTimeDefault;
  return (
    <Link href={`/matches/${m.id}`} className="match-row">
      <Title />
      <Subtitle formatDateTime={fmt} />
      <SlotsLine />
    </Link>
  );
}

LinkRow.displayName = "MatchCard.LinkRow";

function registrationShortLabel(reg: Registration): string {
  if (reg.status === "CONFIRMED") {
    return "Titular";
  }
  if (reg.status === "SUBSTITUTE") {
    return "Reserva";
  }
  if (reg.status === "ABSENT") {
    return "Não irei";
  }
  return "Sem inscrição";
}

function isRegistrationWindowOpen(m: Match): boolean {
  try {
    const now = Date.now();
    const open = new Date(m.registrationOpensAt).getTime();
    const close = new Date(m.registrationClosesAt).getTime();
    return now >= open && now <= close;
  } catch {
    return false;
  }
}

function ListRowWithActions({
  formatDateTime,
  onListChange,
}: {
  formatDateTime?: (iso: string) => string;
  onListChange: () => void | Promise<void>;
}) {
  const m = useMatch();
  const fmt = formatDateTime ?? formatDateTimeDefault;
  const reg = m.myRegistration;
  const [busy, setBusy] = useState<"in" | "out" | "absent" | "clear_absent" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const openForRegistration = m.status === "OPEN" && isRegistrationWindowOpen(m);
  const isAbsent = reg?.status === "ABSENT";
  const hasActiveRegistration =
    reg?.status === "CONFIRMED" || reg?.status === "SUBSTITUTE";

  async function onRegister() {
    setErr(null);
    setBusy("in");
    try {
      await registerForMatch(m.id, "ANY");
      await onListChange();
    } catch (e) {
      setErr(mapPlayerApiError(e));
    } finally {
      setBusy(null);
    }
  }

  async function onDecline() {
    if (!hasActiveRegistration) {
      return;
    }
    if (
      !window.confirm(
        "Retirar o teu nome da lista desta partida? Se fores titular, a primeira reserva inscrita passa a titular.",
      )
    ) {
      return;
    }
    setErr(null);
    setBusy("out");
    try {
      await cancelMyRegistration(m.id);
      await onListChange();
    } catch (e) {
      setErr(mapPlayerApiError(e));
    } finally {
      setBusy(null);
    }
  }

  async function onMarkAbsent() {
    setErr(null);
    setBusy("absent");
    try {
      await markMyAbsence(m.id);
      await onListChange();
    } catch (e) {
      setErr(mapPlayerApiError(e));
    } finally {
      setBusy(null);
    }
  }

  async function onClearAbsent() {
    if (!isAbsent) {
      return;
    }
    setErr(null);
    setBusy("clear_absent");
    try {
      await clearMyAbsence(m.id);
      await onListChange();
    } catch (e) {
      setErr(mapPlayerApiError(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="match-list-item">
      <Link href={`/matches/${m.id}`} className="match-row-link">
        <span className="match-row-link-title">
          <Title />
        </span>
        <Subtitle formatDateTime={fmt} />
        <SlotsLine />
        {reg ? (
          <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Estado: <span className="badge">{registrationShortLabel(reg)}</span>
          </div>
        ) : null}
        <div className="muted" style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
          <span className="badge badge-success">Confirmados: {m.confirmedTitularCount}</span>{" "}
          <span className="badge badge-danger">Ausentes: {m.absentCount}</span>
        </div>
        {err ? (
          <p
            className="alert"
            role="alert"
            style={{ margin: "0.5rem 0 0", fontSize: "0.8125rem" }}
          >
            {err}
          </p>
        ) : null}
      </Link>
      <div className="match-row-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={Boolean(reg) || !openForRegistration || busy !== null}
          onClick={() => void onRegister()}
        >
          {busy === "in" ? "A inscrever…" : "Inscrever-me"}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={!hasActiveRegistration || busy !== null}
          title={!hasActiveRegistration ? "Disponível quando estás inscrito na partida." : undefined}
          onClick={() => void onDecline()}
        >
          {busy === "out" ? "A desinscrever…" : "Desinscrever"}
        </button>
        <button
          type="button"
          className="btn"
          disabled={
            hasActiveRegistration || isAbsent || !openForRegistration || busy !== null
          }
          title={
            hasActiveRegistration
              ? "Desinscreve-te primeiro para marcar ausência."
              : undefined
          }
          onClick={() => void onMarkAbsent()}
        >
          {busy === "absent" ? "A marcar…" : "Não irei"}
        </button>
        <button
          type="button"
          className="btn"
          disabled={!isAbsent || busy !== null}
          title={!isAbsent ? "Disponível quando já marcaste ausência." : undefined}
          onClick={() => void onClearAbsent()}
        >
          {busy === "clear_absent" ? "A remover…" : "Remover ausência"}
        </button>
      </div>
    </div>
  );
}

ListRowWithActions.displayName = "MatchCard.ListRowWithActions";

export const MatchCard = {
  Root,
  Title,
  Meta,
  LinkRow,
  ListRowWithActions,
  Subtitle,
  SlotsLine,
};
