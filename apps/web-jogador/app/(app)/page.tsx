"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "../../components/atoms/spinner";
import { MatchCard } from "../../components/organisms/match-card";
import { listMatches } from "../../lib/api";
import { listMatchesPollingIntervalMs } from "../../lib/match-refresh-policy";
import type { Match } from "../../lib/types";
import { useVisibilityPolling } from "../../lib/use-visibility-polling";

export default function HomePage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [mineFilter, setMineFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState("next");
  const [locationFilter, setLocationFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const refreshMatches = useCallback(async () => {
    const data = await listMatches();
    setMatches(data);
    setError(null);
  }, []);

  const listPollMs = useMemo(() => listMatchesPollingIntervalMs(matches), [matches]);

  useVisibilityPolling(() => {
    void (async () => {
      try {
        await refreshMatches();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao atualizar partidas.");
      }
    })();
  }, listPollMs);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listMatches();
        if (!cancelled) {
          setMatches(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar partidas.");
          setMatches(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fieldOptions = useMemo(() => {
    const names = new Set((matches ?? []).map((m) => m.venue.name).filter(Boolean));
    return Array.from(names).sort();
  }, [matches]);

  const groupOptions = useMemo(() => {
    const labels = new Set(
      (matches ?? [])
        .filter((m) => m.visibility === "GROUP")
        .map((m) => m.groupId ?? "grupo"),
    );
    return Array.from(labels);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const now = Date.now();
    return (matches ?? []).filter((m) => {
      if (fieldFilter !== "all" && m.venue.name !== fieldFilter) {
        return false;
      }
      if (groupFilter !== "all" && (m.groupId ?? "grupo") !== groupFilter) {
        return false;
      }
      if (mineFilter && !m.myRegistration) {
        return false;
      }
      if (dateFilter === "next" && new Date(m.dateTime).getTime() < now) {
        return false;
      }
      if (locationFilter !== "all") {
        const loc = (m.venue.locality ?? "").toLowerCase();
        if (locationFilter === "north" && !loc.includes("porto")) {
          return false;
        }
        if (locationFilter === "south" && !loc.includes("lisboa")) {
          return false;
        }
      }
      if (periodFilter !== "all") {
        const h = new Date(m.dateTime).getHours();
        if (periodFilter === "morning" && !(h >= 6 && h < 12)) {
          return false;
        }
        if (periodFilter === "afternoon" && !(h >= 12 && h < 18)) {
          return false;
        }
        if (periodFilter === "night" && !(h >= 18 || h < 6)) {
          return false;
        }
      }
      if (typeFilter !== "all") {
        const title = m.title.toLowerCase();
        if (!title.includes(typeFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [
    matches,
    fieldFilter,
    groupFilter,
    mineFilter,
    dateFilter,
    locationFilter,
    periodFilter,
    typeFilter,
  ]);

  const groupedMatches = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filteredMatches) {
      const key = `${m.venue.name}___${m.groupId ?? "public"}`;
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const [venueName, groupIdValue] = key.split("___");
      return {
        title:
          groupIdValue === "public"
            ? venueName
            : `${venueName} · Grupo ${groupIdValue.slice(0, 6)}`,
        items,
      };
    });
  }, [filteredMatches]);

  function clearFilters() {
    setFieldFilter("all");
    setGroupFilter("all");
    setMineFilter(false);
    setDateFilter("next");
    setLocationFilter("all");
    setPeriodFilter("all");
    setTypeFilter("all");
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
            <option value="all">Todos os grupos</option>
            {groupOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="row">
          <input type="checkbox" checked={mineFilter} onChange={(e) => setMineFilter(e.target.checked)} />
          Minhas inscrições
        </label>
        <label className="stack">
          <span>Data</span>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="next">Próximos jogos</option>
            <option value="all">Todos os horários</option>
          </select>
        </label>
        <label className="stack">
          <span>Localização</span>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="all">Todas as regiões</option>
            <option value="south">Sul (Lisboa)</option>
            <option value="north">Norte (Porto)</option>
          </select>
        </label>
        <label className="stack">
          <span>Período</span>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option value="all">Todos os horários</option>
            <option value="morning">Manhã</option>
            <option value="afternoon">Tarde</option>
            <option value="night">Noite</option>
          </select>
        </label>
        <label className="stack">
          <span>Tipo de jogo</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Todos os tipos</option>
            <option value="7x7">7x7</option>
            <option value="5x5">5x5</option>
            <option value="6x6">6x6</option>
            <option value="11x11">11x11</option>
          </select>
        </label>
        <button type="button" className="btn btn-secondary" onClick={clearFilters}>
          Limpar filtros
        </button>
      </aside>

      <main className="stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1 className="page-title">Partidas</h1>
          <Link href="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Atualizar
          </Link>
        </div>
        {error ? (
          <p className="alert" role="alert">
            {error}
          </p>
        ) : null}
        {matches === null && !error ? <Spinner /> : null}
        {matches && filteredMatches.length === 0 ? (
          <p className="muted">Nenhuma partida encontrada para os filtros selecionados.</p>
        ) : null}
        {groupedMatches.map((group) => (
          <section key={group.title} className="match-group panel-card">
            <h2 className="match-group-title">{group.title}</h2>
            {group.items.map((m) => (
              <MatchCard.Root key={m.id} match={m}>
                <MatchCard.ListRowWithActions onListChange={refreshMatches} />
              </MatchCard.Root>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
