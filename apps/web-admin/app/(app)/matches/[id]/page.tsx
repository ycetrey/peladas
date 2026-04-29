"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { generateTeams, getMatch } from "../../../../lib/api";
import { matchModeLabelPt } from "../../../../lib/match-mode";
import type { GenerateTeamsResponse, Match } from "../../../../lib/types";

function mapErr(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Pedido falhou.";
  }
  const code = (err as Error & { code?: string }).code;
  if (code === "TeamsAlreadyGeneratedError") {
    return "Os equipas já foram gerados para esta partida.";
  }
  if (code === "WrongConfirmedCountForTeamsError") {
    return "O número de titulares confirmados não coincide com o máximo da partida.";
  }
  if (code === "MatchNotFoundError") {
    return "Partida não encontrada.";
  }
  return err.message;
}

export default function AdminMatchPage() {
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
    <main>
      <p>
        <Link href="/">← Painel</Link>
      </p>
      {loadError ? (
        <p className="alert" role="alert">
          {loadError}
        </p>
      ) : null}
      {!match && !loadError ? <p className="muted">A carregar…</p> : null}
      {match ? (
        <div className="stack">
          <h1 className="page-title">{match.title}</h1>
          <p className="muted">
            <span className="badge">{match.status}</span> · {matchModeLabelPt(match.mode)} · titulares:{" "}
            {match.maxPlayers} · <span className="badge">{match.visibility}</span>
          </p>
          <p>
            <strong>Campo:</strong> {match.venue.name}
            {match.venue.locality ? ` · ${match.venue.locality}` : ""}
          </p>
          <p className="muted">Inscrições: {match.registrationOpensAt} — {match.registrationClosesAt}</p>

          <section className="stack" aria-labelledby="gen-heading">
            <h2 id="gen-heading" style={{ fontSize: "1.125rem", margin: 0 }}>
              Geração de equipas
            </h2>
            <p className="muted">
              Só funciona quando existem exatamente <strong>{match.maxPlayers}</strong> inscrições{" "}
              <strong>CONFIRMED</strong> e ainda não há equipas A/B.
            </p>
            {actionError ? (
              <p className="alert" role="alert">
                {actionError}
              </p>
            ) : null}
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void onGenerate()}>
              {busy ? "A processar…" : "Gerar equipas A/B"}
            </button>
            {result ? (
              <div className="stack">
                <p className="muted">Equipas criados: {result.teams.length}</p>
                <ul className="muted">
                  {result.teams.map((t) => (
                    <li key={t.id}>
                      Equipa {t.name}: {t.players.length} jogadores
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}
