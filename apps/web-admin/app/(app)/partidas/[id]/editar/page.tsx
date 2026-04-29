"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { generateTeams, getMatch } from "../../../../../lib/api";
import { matchModeLabelPt } from "../../../../../lib/match-mode";
import type { GenerateTeamsResponse, Match } from "../../../../../lib/types";

function mapErr(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Pedido falhou.";
  }
  return err.message;
}

export default function AdminEditMatchPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [match, setMatch] = useState<Match | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateTeamsResponse | null>(null);
  const [busy, setBusy] = useState(false);

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
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setMatch(null);
          setLoadError(mapErr(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const participants = useMemo(
    () => [
      { name: "Confirmados", count: match?.confirmedTitularCount ?? 0, kind: "success" as const },
      { name: "Ausentes", count: match?.absentCount ?? 0, kind: "danger" as const },
      {
        name: "Pendentes",
        count: Math.max((match?.maxPlayers ?? 0) - (match?.confirmedTitularCount ?? 0), 0),
        kind: "warning" as const,
      },
    ],
    [match],
  );

  async function onGenerate() {
    if (!id) {
      return;
    }
    setBusy(true);
    setActionError(null);
    setResult(null);
    try {
      const res = await generateTeams(id);
      setResult(res);
      setMatch(await getMatch(id));
    } catch (e) {
      setActionError(mapErr(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
        <div className="row">
          <button type="button" className="btn btn-primary" disabled>
            Salvar
          </button>
          <button type="button" className="btn btn-danger" disabled>
            Deletar
          </button>
        </div>
      </div>

      {loadError ? (
        <p className="alert" role="alert">
          {loadError}
        </p>
      ) : null}
      {!match && !loadError ? <p className="muted">A carregar…</p> : null}

      {match ? (
        <div className="dashboard-layout">
          <section className="panel-card stack">
            <h1 className="page-title">Editar Partida</h1>
            <p className="muted">
              <span className="badge">{match.status}</span> · {matchModeLabelPt(match.mode)} ·{" "}
              {match.visibility === "GROUP" ? "Grupo" : "Pública"}
            </p>

            <div className="two-col">
              <label className="stack">
                <span>Título</span>
                <input className="input" value={match.title} readOnly />
              </label>
              <label className="stack">
                <span>Campo</span>
                <input className="input" value={match.venue.name} readOnly />
              </label>
              <label className="stack">
                <span>Data e hora</span>
                <input className="input" value={new Date(match.dateTime).toLocaleString("pt-PT")} readOnly />
              </label>
              <label className="stack">
                <span>Lugares</span>
                <input
                  className="input"
                  value={`${match.maxPlayers} titulares / ${match.maxSubstitutes} reservas`}
                  readOnly
                />
              </label>
            </div>

            <section className="stack">
              <h2 className="section-title">Geração de times</h2>
              {actionError ? (
                <p className="alert" role="alert">
                  {actionError}
                </p>
              ) : null}
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void onGenerate()}>
                {busy ? "A processar..." : "Gerar equipas A/B"}
              </button>
              {result ? (
                <p className="muted">Equipes geradas com sucesso: {result.teams.length}</p>
              ) : null}
            </section>
          </section>

          <aside className="sidebar-card stack">
            <h2 className="section-title">Participantes</h2>
            <div className="row">
              {participants.map((p) => (
                <span
                  key={p.name}
                  className={`badge ${
                    p.kind === "success"
                      ? "badge-success"
                      : p.kind === "danger"
                        ? "badge-danger"
                        : "badge-warning"
                  }`}
                >
                  {p.name} ({p.count})
                </span>
              ))}
            </div>
            <p className="muted">
              Vagas disponíveis: {match.titularSlotsRemaining} titular(es) ·{" "}
              {Math.max(match.maxSubstitutes - (match.activeRegistrationCount - match.confirmedTitularCount - match.absentCount), 0)}{" "}
              reserva(s)
            </p>
            <div className="panel-card">
              <strong>Descrição</strong>
              <p className="muted" style={{ margin: "0.4rem 0 0" }}>
                A descrição detalhada e lista nominal de participantes serão ampliadas na próxima fase de
                dados/dependências.
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
