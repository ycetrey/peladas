"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "../../../components/atoms/spinner";
import { listGroups } from "../../../lib/api";
import type { GroupWithMembers } from "../../../lib/types";

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithMembers[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setGroups(await listGroups());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar.");
      setGroups([]);
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
        <Link href="/groups/nova" className="btn btn-primary" style={{ textDecoration: "none" }}>
          Novo grupo
        </Link>
      </div>
      <h1 className="page-title">Grupos</h1>
      <p className="muted">
        O teu catálogo de grupos: só vês os que criaste. Partidas <strong>privadas ao grupo</strong>{" "}
        só aparecem aos jogadores que estão na lista (por e-mail de conta registada).
      </p>

      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      <section className="panel-card stack">
        <h2 className="section-title">Lista</h2>
        {groups === null ? <Spinner label="A carregar" /> : null}
        {groups && groups.length === 0 ? (
          <p className="muted">
            Ainda não tens grupos.{" "}
            <Link href="/groups/nova" style={{ fontWeight: 600 }}>
              Criar o primeiro
            </Link>
            .
          </p>
        ) : null}
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {groups?.map((g) => (
            <li key={g.id}>
              <Link
                href={`/groups/${g.id}/editar`}
                className="match-row-link"
                style={{ display: "block", padding: "0.65rem 0" }}
              >
                <span className="match-row-link-title">{g.name}</span>
                <div className="muted" style={{ fontSize: "0.875rem" }}>
                  {g.members.length} membro(s)
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
