"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listMatches } from "../lib/api";
import type { Match } from "../lib/types";

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

export default function Home() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listMatches();
        if (!cancelled) {
          setMatches(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar partidas.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <h1 className="page-title">Partidas</h1>
      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}
      {matches === null && !error ? <p className="muted">A carregar…</p> : null}
      {matches && matches.length === 0 ? (
        <p className="muted">Ainda não há partidas públicas.</p>
      ) : null}
      {matches?.map((m) => (
        <Link key={m.id} href={`/matches/${m.id}`} className="match-row">
          <strong>{m.title}</strong>
          <div className="muted">
            {formatDateTime(m.dateTime)} · {m.mode} ·{" "}
            <span className="badge">{m.status}</span>
          </div>
        </Link>
      ))}
    </main>
  );
}
