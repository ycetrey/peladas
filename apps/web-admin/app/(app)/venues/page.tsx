"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "../../../components/atoms/spinner";
import { listVenues } from "../../../lib/api";
import type { Venue } from "../../../lib/types";

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setVenues(await listVenues());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar.");
      setVenues([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0 }}>
          <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            ← Painel
          </Link>
        </p>
        <Link href="/venues/nova" className="btn btn-primary" style={{ textDecoration: "none" }}>
          Novo campo
        </Link>
      </div>
      <h1 className="page-title">Campos / locais</h1>
      <p className="muted">
        O teu catálogo pessoal: só vês e reutilizas os campos que criaste. Ao criar uma partida, o
        dropdown usa esta mesma lista.
      </p>

      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      <section className="panel-card stack">
        <h2 className="section-title">Lista</h2>
        {venues === null ? <Spinner label="A carregar" /> : null}
        {venues && venues.length === 0 ? (
          <p className="muted">
            Ainda não tens campos.{" "}
            <Link href="/venues/nova" style={{ fontWeight: 600 }}>
              Criar o primeiro
            </Link>
            .
          </p>
        ) : null}
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {venues?.map((v) => (
            <li key={v.id}>
              <Link
                href={`/venues/${v.id}/editar`}
                className="match-row-link"
                style={{ display: "block", padding: "0.65rem 0" }}
              >
                <span className="match-row-link-title">{v.name}</span>
                {v.googlePlaceId ? (
                  <span className="badge" style={{ marginLeft: "0.35rem" }}>
                    Google
                  </span>
                ) : null}
                {v.locality ? (
                  <div className="muted" style={{ fontSize: "0.875rem" }}>
                    {v.locality}
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
