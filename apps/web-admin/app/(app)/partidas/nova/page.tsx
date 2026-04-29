"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createMatch, listGroups, listVenues } from "../../../../lib/api";
import type { MatchMode, MatchVisibility } from "../../../../lib/types";

function toIsoFromLocal(dtLocal: string): string {
  const d = new Date(dtLocal);
  if (Number.isNaN(d.getTime())) {
    return dtLocal;
  }
  return d.toISOString();
}

export default function AdminCreateMatchPage() {
  const [venues, setVenues] = useState<{ id: string; name: string; locality?: string | null }[]>(
    [],
  );
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("Pelada da semana");
  const [venueId, setVenueId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mode, setMode] = useState<MatchMode>("ALTERNATED");
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [maxSubstitutes, setMaxSubstitutes] = useState("2");
  const [registrationOpensAt, setRegistrationOpensAt] = useState("");
  const [registrationClosesAt, setRegistrationClosesAt] = useState("");
  const [visibility, setVisibility] = useState<MatchVisibility>("PUBLIC");
  const [groupId, setGroupId] = useState("");
  const [description, setDescription] = useState("");
  const [gameType, setGameType] = useState("7x7");
  const [duration, setDuration] = useState("90");
  const [recurring, setRecurring] = useState(false);

  useEffect(() => {
    const now = new Date();
    const kickoff = new Date(now);
    kickoff.setDate(kickoff.getDate() + 7);
    const open = new Date(kickoff);
    open.setDate(open.getDate() - 7);
    const close = new Date(kickoff);
    close.setHours(close.getHours() - 2);
    const end = new Date(kickoff);
    end.setHours(end.getHours() + 2);
    const slice = (d: Date) => d.toISOString().slice(0, 16);
    setDateTime((p) => p || slice(kickoff));
    setEndTime((p) => p || slice(end));
    setRegistrationOpensAt((p) => p || slice(open));
    setRegistrationClosesAt((p) => p || slice(close));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [v, g] = await Promise.all([listVenues(), listGroups()]);
        if (cancelled) {
          return;
        }
        setVenues(v);
        setGroups(g);
        setVenueId((prev) => prev || v[0]?.id || "");
        setGroupId((prev) => prev || g[0]?.id || "");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar dados iniciais.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createMatch({
        title: title.trim(),
        dateTime: toIsoFromLocal(dateTime),
        mode,
        maxPlayers: Number(maxPlayers),
        maxSubstitutes: Number(maxSubstitutes),
        registrationOpensAt: toIsoFromLocal(registrationOpensAt),
        registrationClosesAt: toIsoFromLocal(registrationClosesAt),
        venueId,
        visibility,
        ...(visibility === "GROUP" ? { groupId } : {}),
      });
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar partida.");
      setSaving(false);
    }
  }

  return (
    <main className="panel-card stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
        <button type="submit" form="new-match-form" className="btn btn-primary" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
      <h1 className="page-title">Nova Partida</h1>
      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}
      <form id="new-match-form" className="stack" onSubmit={onSave}>
        <section className="stack">
          <h2 className="section-title">Campo/Local</h2>
          <label className="stack">
            <span>Selecione o campo</span>
            <select required value={venueId} onChange={(e) => setVenueId(e.target.value)}>
              <option value="">Selecione...</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.locality ? ` · ${v.locality}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="stack">
            <span>Endereço</span>
            <input className="input" value={venues.find((v) => v.id === venueId)?.name ?? ""} readOnly />
          </label>
          <label className="stack">
            <span>Referência/Descrição</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
          </label>
        </section>

        <section className="stack">
          <h2 className="section-title">Data e Hora</h2>
          <div className="two-col">
            <label className="stack">
              <span>Data e início</span>
              <input className="input" type="datetime-local" required value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
            </label>
            <label className="stack">
              <span>Horário de término</span>
              <input className="input" type="datetime-local" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
          </div>
        </section>

        <section className="stack">
          <h2 className="section-title">Detalhes do Jogo</h2>
          <div className="two-col">
            <label className="stack">
              <span>Tipo de jogo</span>
              <select value={gameType} onChange={(e) => setGameType(e.target.value)}>
                <option value="7x7">7x7</option>
                <option value="5x5">5x5</option>
                <option value="6x6">6x6</option>
                <option value="11x11">11x11</option>
              </select>
            </label>
            <label className="stack">
              <span>Duração (minutos)</span>
              <input className="input" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </label>
            <label className="stack">
              <span>Vagas de titular</span>
              <input className="input" type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} />
            </label>
            <label className="stack">
              <span>Vagas de reserva</span>
              <input className="input" type="number" value={maxSubstitutes} onChange={(e) => setMaxSubstitutes(e.target.value)} />
            </label>
          </div>
        </section>

        <section className="stack">
          <h2 className="section-title">Grupo/Time</h2>
          <div className="two-col">
            <label className="stack">
              <span>Visibilidade</span>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as MatchVisibility)}>
                <option value="PUBLIC">Pública</option>
                <option value="GROUP">Grupo</option>
              </select>
            </label>
            <label className="stack">
              <span>Selecione o grupo</span>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={visibility !== "GROUP"}
              >
                <option value="">Selecione...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="row">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
            Jogo recorrente
          </label>
        </section>

        <section className="stack">
          <h2 className="section-title">Janelas de inscrição</h2>
          <div className="two-col">
            <label className="stack">
              <span>Inscrição abre</span>
              <input className="input" type="datetime-local" value={registrationOpensAt} onChange={(e) => setRegistrationOpensAt(e.target.value)} />
            </label>
            <label className="stack">
              <span>Inscrição fecha</span>
              <input className="input" type="datetime-local" value={registrationClosesAt} onChange={(e) => setRegistrationClosesAt(e.target.value)} />
            </label>
          </div>
        </section>
      </form>
    </main>
  );
}
