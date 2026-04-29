"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelMyRegistration,
  clearMyAbsence,
  getMatch,
  markMyAbsence,
  registerForMatch,
} from "../../../../lib/api";
import { mapPlayerApiError } from "../../../../lib/map-api-error";
import { matchModeLabelPt } from "../../../../lib/match-mode";
import { matchDetailPollingIntervalMs } from "../../../../lib/match-refresh-policy";
import type { Match, PlayerPosition, Registration } from "../../../../lib/types";
import { useVisibilityPolling } from "../../../../lib/use-visibility-polling";

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-PT", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function registrationLabel(reg: Registration | null): string {
  if (!reg) {
    return "Sem inscrição/ausência ativa";
  }
  if (reg.status === "CONFIRMED") {
    return "Titular";
  }
  if (reg.status === "SUBSTITUTE") {
    return "Reserva";
  }
  if (reg.status === "ABSENT") {
    return "Não irei";
  }
  return "Cancelado";
}

const POSITION_OPTIONS: { value: PlayerPosition; label: string }[] = [
  { value: "ANY", label: "Qualquer" },
  { value: "GOALKEEPER", label: "Goleiro" },
  { value: "DEFENDER", label: "Zagueiro" },
  { value: "MIDFIELDER", label: "Meio-campo" },
  { value: "FORWARD", label: "Atacante" },
];

function positionLabel(value: PlayerPosition): string {
  return POSITION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export default function MatchDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [match, setMatch] = useState<Match | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [myReg, setMyReg] = useState<Registration | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [position, setPosition] = useState<PlayerPosition>("ANY");
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [markingAbsent, setMarkingAbsent] = useState(false);
  const [clearingAbsent, setClearingAbsent] = useState(false);

  const loadMatchPage = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!id) {
        setMyReg(null);
        return;
      }
      const silent = opts?.silent === true;
      if (!silent) {
        setRegLoading(true);
        setMatchError(null);
      }
      try {
        const m = await getMatch(id);
        setMatch(m);
        setMyReg(m.myRegistration ?? null);
        if (!silent) {
          setMatchError(null);
        }
      } catch (e) {
        if (!silent) {
          setMatch(null);
          setMatchError(mapPlayerApiError(e));
          setMyReg(null);
        }
      } finally {
        if (!silent) {
          setRegLoading(false);
        }
      }
    },
    [id],
  );

  useEffect(() => {
    void loadMatchPage();
  }, [loadMatchPage]);

  const detailPollMs = useMemo(() => matchDetailPollingIntervalMs(match), [match]);

  useVisibilityPolling(() => {
    void loadMatchPage({ silent: true });
  }, detailPollMs);

  async function onRegister() {
    if (!id) {
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      await registerForMatch(id, position);
      await loadMatchPage({ silent: true });
    } catch (e) {
      setActionError(mapPlayerApiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function onCancel() {
    if (!id) {
      return;
    }
    if (
      !window.confirm(
        "Retirar o teu nome da lista desta partida? Se fores titular, a primeira reserva inscrita passa a titular.",
      )
    ) {
      return;
    }
    setCanceling(true);
    setActionError(null);
    try {
      await cancelMyRegistration(id);
      await loadMatchPage({ silent: true });
    } catch (e) {
      setActionError(mapPlayerApiError(e));
    } finally {
      setCanceling(false);
    }
  }

  const hasActiveReg = myReg !== null;
  const isAbsent = myReg?.status === "ABSENT";
  const hasRegistration =
    myReg?.status === "CONFIRMED" || myReg?.status === "SUBSTITUTE";

  async function onMarkAbsent() {
    if (!id) {
      return;
    }
    setMarkingAbsent(true);
    setActionError(null);
    try {
      await markMyAbsence(id);
      await loadMatchPage({ silent: true });
    } catch (e) {
      setActionError(mapPlayerApiError(e));
    } finally {
      setMarkingAbsent(false);
    }
  }

  async function onClearAbsent() {
    if (!id) {
      return;
    }
    setClearingAbsent(true);
    setActionError(null);
    try {
      await clearMyAbsence(id);
      await loadMatchPage({ silent: true });
    } catch (e) {
      setActionError(mapPlayerApiError(e));
    } finally {
      setClearingAbsent(false);
    }
  }

  return (
    <main>
      <p>
        <Link href="/">← Voltar às partidas</Link>
      </p>
      {matchError ? (
        <p className="alert" role="alert">
          {matchError}
        </p>
      ) : null}
      {!match && !matchError ? <p className="muted">A carregar…</p> : null}
      {match ? (
        <div className="stack">
          <h1 className="page-title">{match.title}</h1>
          <div className="row">
            <span className="badge">{match.status}</span> · {matchModeLabelPt(match.mode)}
            {match.visibility === "GROUP" ? (
              <>
                {" "}
                · <span className="badge">Grupo</span>
              </>
            ) : null}
          </div>
          <p>
            <strong>Campo:</strong> {match.venue.name}
            {match.venue.locality ? ` · ${match.venue.locality}` : ""}
          </p>
          <p>
            <strong>Data da partida:</strong> {formatDateTime(match.dateTime)}
          </p>
          <p className="muted">
            <strong>Vagas de titular:</strong>{" "}
            {match.titularSlotsRemaining <= 0 ? "Lotado" : match.titularSlotsRemaining}
          </p>
          <p className="muted">
            <strong>Presença sinalizada:</strong> {match.activeRegistrationCount} ·{" "}
            <strong>Não irão:</strong> {match.absentCount}
          </p>
          <p>
            <strong>Inscrições:</strong> {formatDateTime(match.registrationOpensAt)} —{" "}
            {formatDateTime(match.registrationClosesAt)}
          </p>
          <p>
            <strong>Lugares:</strong> {match.maxPlayers} titulares, até {match.maxSubstitutes}{" "}
            reservas
          </p>
          <p className="muted" style={{ maxWidth: "40rem" }}>
            Só os <strong>titulares</strong> entram na partida e na formação dos times; as{" "}
            <strong>reservas</strong> ficam apenas na lista de espera. Se um titular sair, a primeira
            reserva (por ordem de inscrição) passa automaticamente a titular — na última posição da
            fila de titulares.
          </p>

          <section aria-labelledby="reg-heading" className="stack">
            <h2 id="reg-heading" style={{ fontSize: "1.125rem", margin: "1rem 0 0" }}>
              A tua inscrição
            </h2>
            {actionError ? (
              <p className="alert" role="alert">
                {actionError}
              </p>
            ) : null}
            {regLoading ? <p className="muted">A carregar inscrição…</p> : null}
            {!regLoading ? (
              <p>
                <strong>Estado:</strong> {registrationLabel(myReg)}
                {myReg && myReg.status !== "CANCELED" ? (
                  <>
                    {" "}
                    · fila: {myReg.queueOrder} · posição preferida: {positionLabel(myReg.preferredPosition)}
                  </>
                ) : null}
              </p>
            ) : null}

            {!hasActiveReg && !regLoading ? (
              <div className="stack">
                <label htmlFor="pref-pos" style={{ fontWeight: 600 }}>
                  Posição preferida
                </label>
                <select
                  id="pref-pos"
                  value={position}
                  onChange={(ev) => setPosition(ev.target.value as PlayerPosition)}
                  style={{ maxWidth: "16rem", padding: "0.375rem" }}
                >
                  {POSITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={submitting}
                    onClick={() => void onRegister()}
                  >
                    {submitting ? "A inscrever…" : "Inscrever"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={markingAbsent}
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => void onMarkAbsent()}
                  >
                    {markingAbsent ? "A marcar…" : "Não irei"}
                  </button>
                </div>
              </div>
            ) : null}

            {hasRegistration ? (
              <div className="stack">
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={canceling}
                  onClick={() => void onCancel()}
                >
                  {canceling ? "A retirar…" : "Retirar da lista"}
                </button>
                <p className="muted" style={{ fontSize: "0.875rem", margin: 0 }}>
                  Equivale a cancelar a inscrição. Titulares que saem abrem vaga à primeira reserva.
                </p>
              </div>
            ) : null}

            {isAbsent ? (
              <div className="stack">
                <button
                  type="button"
                  className="btn"
                  disabled={clearingAbsent}
                  onClick={() => void onClearAbsent()}
                >
                  {clearingAbsent ? "A remover…" : "Remover voto de ausência"}
                </button>
                <p className="muted" style={{ fontSize: "0.875rem", margin: 0 }}>
                  Ao remover a ausência, podes voltar a inscrever-te na partida.
                </p>
              </div>
            ) : null}
            <button type="button" className="btn btn-secondary">
              Compartilhar
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
