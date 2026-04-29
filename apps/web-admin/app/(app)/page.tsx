"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "../../components/atoms/spinner";
import { listMatches } from "../../lib/api";
import type { Match } from "../../lib/types";

export default function AdminHomePage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadMatches = useCallback(async () => {
    setListError(null);
    try {
      setMatches(await listMatches());
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Erro ao listar.");
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const fieldOptions = useMemo(() => {
    const names = new Set((matches ?? []).map((m) => m.venue?.name ?? "—"));
    return Array.from(names).sort();
  }, [matches]);

  const grouped = useMemo(() => {
    const filtered = (matches ?? []).filter((m) => {
      if (fieldFilter !== "all" && (m.venue?.name ?? "—") !== fieldFilter) {
        return false;
      }
      if (groupFilter !== "all") {
        const val = m.groupId ?? "public";
        if (val !== groupFilter) {
          return false;
        }
      }
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false;
      }
      return true;
    });
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const key = `${m.venue?.name ?? "Sem campo"}___${m.groupId ?? "public"}`;
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const [venue, group] = key.split("___");
      return {
        title: group === "public" ? venue : `${venue} · Grupo`,
        items,
      };
    });
  }, [matches, fieldFilter, groupFilter, statusFilter]);

  function clearFilters() {
    setFieldFilter("all");
    setGroupFilter("all");
    setStatusFilter("all");
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar-card stack">
        <h2 className="section-title">Filtros</h2>
        <label className="stack">
          <span>Campos</span>
          <select value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)}>
            <option value="all">Todos os campos</option>
            {fieldOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="stack">
          <span>Grupos</span>
          <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="public">Públicas</option>
          </select>
        </label>
        <label className="stack">
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="FINISHED">FINISHED</option>
          </select>
        </label>
        <button type="button" className="btn btn-secondary" onClick={clearFilters}>
          Limpar filtros
        </button>
      </aside>

      <main className="stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1 className="page-title">Dashboard de Partidas</h1>
          <Link href="/partidas/nova" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Nova Partida
          </Link>
        </div>
        {listError ? (
          <p className="alert" role="alert">
            {listError}
          </p>
        ) : null}
        {matches === null ? <Spinner label="A carregar lista" /> : null}
        {matches && grouped.length === 0 ? (
          <p className="muted">Sem partidas para os filtros selecionados.</p>
        ) : null}
        {grouped.map((group) => (
          <section key={group.title} className="panel-card stack">
            <h2 className="section-title">{group.title}</h2>
            {group.items.map((m) => (
              <Link key={m.id} href={`/partidas/${m.id}/editar`} className="match-row-link">
                <article className="match-list-item">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <strong>{m.title}</strong>
                    <span className="badge">{m.status}</span>
                  </div>
                  <div className="muted">
                    {m.venue?.name ?? "—"} · {new Date(m.dateTime).toLocaleString("pt-PT")} ·{" "}
                    {m.visibility === "GROUP" ? "Grupo" : "Pública"}
                  </div>
                  <div className="row">
                    <span className="badge badge-success">Confirmados: {m.confirmedTitularCount}</span>
                    <span className="badge badge-danger">Ausentes: {m.absentCount}</span>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
