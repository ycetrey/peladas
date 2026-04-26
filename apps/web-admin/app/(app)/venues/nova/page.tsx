"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "../../../../components/atoms/spinner";
import { TextField } from "../../../../components/molecules/text-field";
import {
  createVenue,
  createVenueFromGooglePlace,
  suggestVenuePlaces,
} from "../../../../lib/api";
import type { VenuePlaceSuggestion } from "../../../../lib/types";

export default function VenuesNovaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [locality, setLocality] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [placeQuery, setPlaceQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<VenuePlaceSuggestion[]>([]);
  const [placeBusy, setPlaceBusy] = useState(false);
  const [placeSavingId, setPlaceSavingId] = useState<string | null>(null);
  const [placeHint, setPlaceHint] = useState<string | null>(null);

  useEffect(() => {
    const q = placeQuery.trim();
    if (q.length < 2) {
      setPlaceSuggestions([]);
      setPlaceHint(null);
      return;
    }
    const t = window.setTimeout(() => {
      void (async () => {
        setPlaceBusy(true);
        setPlaceHint(null);
        try {
          const { suggestions } = await suggestVenuePlaces(q);
          setPlaceSuggestions(suggestions);
          if (suggestions.length === 0) {
            setPlaceHint(
              "Sem resultados. Se a API não tiver chave Google Places configurada, usa o formulário manual abaixo.",
            );
          }
        } catch (e) {
          setPlaceSuggestions([]);
          setPlaceHint(e instanceof Error ? e.message : "Erro na pesquisa.");
        } finally {
          setPlaceBusy(false);
        }
      })();
    }, 400);
    return () => window.clearTimeout(t);
  }, [placeQuery]);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!name.trim()) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createVenue({
        name: name.trim(),
        locality: locality.trim() || undefined,
      });
      router.push("/venues");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar.");
    } finally {
      setSaving(false);
    }
  }

  async function onPickGooglePlace(placeId: string) {
    setPlaceSavingId(placeId);
    setError(null);
    try {
      await createVenueFromGooglePlace(placeId);
      setPlaceQuery("");
      setPlaceSuggestions([]);
      router.push("/venues");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar a partir do Google.");
    } finally {
      setPlaceSavingId(null);
    }
  }

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/venues" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
      </div>
      <h1 className="page-title">Novo campo</h1>

      <section className="panel-card stack">
        <h2 className="section-title">Pesquisar no Google Places</h2>
        <p className="muted" style={{ fontSize: "0.875rem", margin: 0 }}>
          A chave fica só no servidor. Se não estiver configurada, a pesquisa devolve vazio — usa o
          formulário manual.
        </p>
        <TextField id="v-places-q" label="Nome ou morada" value={placeQuery} onChange={setPlaceQuery} />
        {placeBusy ? <Spinner label="A pesquisar" /> : null}
        {placeHint && !placeBusy ? <p className="muted">{placeHint}</p> : null}
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {placeSuggestions.map((s) => (
            <li
              key={s.placeId}
              style={{
                padding: "0.75rem 0",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <strong>{s.primaryText}</strong>
                {s.secondaryText ? (
                  <div className="muted" style={{ fontSize: "0.875rem" }}>
                    {s.secondaryText}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={placeSavingId === s.placeId}
                onClick={() => void onPickGooglePlace(s.placeId)}
              >
                {placeSavingId === s.placeId ? "A guardar…" : "Adicionar ao catálogo"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-card stack">
        <h2 className="section-title">Novo campo (manual)</h2>
        <form className="stack" onSubmit={onSubmit} style={{ maxWidth: "28rem" }}>
          <TextField id="v-name" label="Nome" value={name} onChange={setName} required />
          <TextField
            id="v-loc"
            label="Local / zona (opcional)"
            value={locality}
            onChange={setLocality}
          />
          {error ? (
            <p className="alert" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "A guardar…" : "Adicionar campo"}
          </button>
        </form>
      </section>
    </main>
  );
}
