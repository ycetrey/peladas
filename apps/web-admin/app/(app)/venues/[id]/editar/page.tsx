"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TextField } from "../../../../../components/molecules/text-field";
import { deleteVenue, getVenue, updateVenue } from "../../../../../lib/api";

export default function VenuesEditarPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [name, setName] = useState("");
  const [locality, setLocality] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const v = await getVenue(id);
        if (!cancelled) {
          setName(v.name);
          setLocality(v.locality ?? "");
          setGooglePlaceId(v.googlePlaceId ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Erro ao carregar.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSave(ev: React.FormEvent) {
    ev.preventDefault();
    if (!id || !name.trim()) {
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      await updateVenue(id, {
        name: name.trim(),
        locality: locality.trim() === "" ? null : locality.trim(),
      });
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id) {
      return;
    }
    if (
      !window.confirm(
        "Apagar este campo do catálogo? Só é possível se não existirem partidas associadas.",
      )
    ) {
      return;
    }
    setDeleting(true);
    setActionError(null);
    try {
      await deleteVenue(id);
      router.push("/venues");
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao apagar.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/venues" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
        <div className="row">
          <button type="submit" form="venue-form" className="btn btn-primary" disabled={saving || loading}>
            {saving ? "A guardar…" : "Salvar"}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={deleting || loading || Boolean(loadError)}
            onClick={() => void onDelete()}
          >
            {deleting ? "A apagar…" : "Deletar"}
          </button>
        </div>
      </div>

      <h1 className="page-title">Editar campo</h1>

      {loadError ? (
        <p className="alert" role="alert">
          {loadError}
        </p>
      ) : null}
      {loading ? <p className="muted">A carregar…</p> : null}

      {!loading && !loadError ? (
        <section className="panel-card stack">
          {googlePlaceId ? (
            <p className="muted" style={{ margin: 0 }}>
              <span className="badge">Google Places</span> Este registo está ligado a um local do
              Google; o identificador não é editável aqui.
            </p>
          ) : null}
          <form id="venue-form" className="stack" onSubmit={onSave}>
            <TextField id="ve-name" label="Nome" value={name} onChange={setName} required />
            <TextField id="ve-loc" label="Local / zona" value={locality} onChange={setLocality} />
            {actionError ? (
              <p className="alert" role="alert">
                {actionError}
              </p>
            ) : null}
          </form>
        </section>
      ) : null}
    </main>
  );
}
