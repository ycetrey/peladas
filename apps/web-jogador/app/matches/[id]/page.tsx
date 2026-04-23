"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PLAYER_ID_CHANGED,
  readPlayerUserId,
} from "../../components/player-id-settings";
import {
  cancelMyRegistration,
  getMatch,
  getMyRegistration,
  registerForMatch,
} from "../../../lib/api";
import type { Match, PlayerPosition, Registration } from "../../../lib/types";

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
    return "Sem inscrição ativa";
  }
  if (reg.status === "CONFIRMED") {
    return "Titular";
  }
  if (reg.status === "SUBSTITUTE") {
    return "Reserva";
  }
  return "Cancelado";
}

const POSITION_OPTIONS: { value: PlayerPosition; label: string }[] = [
  { value: "ANY", label: "Qualquer" },
  { value: "GOALKEEPER", label: "Guarda-redes" },
  { value: "DEFENDER", label: "Defesa" },
  { value: "MIDFIELDER", label: "Médio" },
  { value: "FORWARD", label: "Avançado" },
];

function mapApiError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Pedido falhou.";
  }
  const code = (err as Error & { code?: string }).code;
  switch (code) {
    case "RegistrationClosedError":
      return "As inscrições estão fechadas para esta partida.";
    case "UserAlreadyRegisteredError":
      return "Já tens uma inscrição ativa nesta partida.";
    case "MatchNotOpenError":
      return "A partida não está aberta a inscrições.";
    case "InvalidMatchStateError":
      return "O estado da partida não permite esta ação.";
    case "NoRegistrationSlotsError":
      return "Não há vagas disponíveis.";
    case "MatchNotFoundError":
      return "Partida não encontrada.";
    default:
      return err.message || "Erro desconhecido.";
  }
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
  const [playerId, setPlayerId] = useState<string | null>(null);

  const refreshPlayerId = useCallback(() => {
    setPlayerId(readPlayerUserId());
  }, []);

  useEffect(() => {
    refreshPlayerId();
    function onIdChanged() {
      refreshPlayerId();
    }
    window.addEventListener(PLAYER_ID_CHANGED, onIdChanged);
    return () => window.removeEventListener(PLAYER_ID_CHANGED, onIdChanged);
  }, [refreshPlayerId]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const m = await getMatch(id);
        if (!cancelled) {
          setMatch(m);
          setMatchError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setMatch(null);
          setMatchError(mapApiError(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadMyRegistration = useCallback(async () => {
    if (!id || !playerId) {
      setMyReg(null);
      return;
    }
    setRegLoading(true);
    setActionError(null);
    try {
      const reg = await getMyRegistration(id, playerId);
      setMyReg(reg);
    } catch (e) {
      setActionError(mapApiError(e));
      setMyReg(null);
    } finally {
      setRegLoading(false);
    }
  }, [id, playerId]);

  useEffect(() => {
    void loadMyRegistration();
  }, [loadMyRegistration]);

  async function onRegister() {
    if (!id || !playerId) {
      setActionError("Define o teu ID no topo antes de te inscreveres.");
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      await registerForMatch(id, playerId, position);
      await loadMyRegistration();
      try {
        setMatch(await getMatch(id));
      } catch {
        // ignore refresh match failure
      }
    } catch (e) {
      setActionError(mapApiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function onCancel() {
    if (!id || !playerId) {
      return;
    }
    if (!window.confirm("Cancelar a tua inscrição nesta partida?")) {
      return;
    }
    setCanceling(true);
    setActionError(null);
    try {
      await cancelMyRegistration(id, playerId);
      await loadMyRegistration();
      try {
        setMatch(await getMatch(id));
      } catch {
        // ignore
      }
    } catch (e) {
      setActionError(mapApiError(e));
    } finally {
      setCanceling(false);
    }
  }

  const hasActiveReg = myReg !== null;

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
          <p className="muted">
            <span className="badge">{match.status}</span> · {match.mode}
          </p>
          <p>
            <strong>Data da partida:</strong> {formatDateTime(match.dateTime)}
          </p>
          <p>
            <strong>Inscrições:</strong> {formatDateTime(match.registrationOpensAt)} —{" "}
            {formatDateTime(match.registrationClosesAt)}
          </p>
          <p>
            <strong>Lugares:</strong> {match.maxPlayers} titulares, até {match.maxSubstitutes}{" "}
            reservas
          </p>

          <section aria-labelledby="reg-heading" className="stack">
            <h2 id="reg-heading" style={{ fontSize: "1.125rem", margin: "1rem 0 0" }}>
              A tua inscrição
            </h2>
            {!playerId ? (
              <p className="alert" role="alert">
                Preenche e guarda o teu UUID no topo para te inscreveres ou veres o estado da
                inscrição.
              </p>
            ) : null}
            {actionError ? (
              <p className="alert" role="alert">
                {actionError}
              </p>
            ) : null}
            {playerId && regLoading ? <p className="muted">A carregar inscrição…</p> : null}
            {playerId && !regLoading ? (
              <p>
                <strong>Estado:</strong> {registrationLabel(myReg)}
                {myReg && myReg.status !== "CANCELED" ? (
                  <>
                    {" "}
                    · fila: {myReg.queueOrder} · posição preferida: {myReg.preferredPosition}
                  </>
                ) : null}
              </p>
            ) : null}

            {playerId && !hasActiveReg ? (
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
                </div>
              </div>
            ) : null}

            {playerId && hasActiveReg ? (
              <div>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={canceling}
                  onClick={() => void onCancel()}
                >
                  {canceling ? "A cancelar…" : "Cancelar inscrição"}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}
