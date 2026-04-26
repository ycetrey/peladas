"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TextField } from "../../../../../components/molecules/text-field";
import {
  addGroupMember,
  deleteGroup,
  getGroup,
  removeGroupMember,
  updateGroup,
} from "../../../../../lib/api";

export default function GroupsEditarPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [name, setName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busyMember, setBusyMember] = useState<string | null>(null);
  const [members, setMembers] = useState<
    { id: string; userId: string; user: { id: string; email: string; name: string } }[]
  >([]);

  const reload = useCallback(async () => {
    if (!id) {
      return;
    }
    const g = await getGroup(id);
    setName(g.name);
    setMembers(g.members);
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        await reload();
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
  }, [id, reload]);

  async function onSave(ev: React.FormEvent) {
    ev.preventDefault();
    if (!id || !name.trim()) {
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      await updateGroup(id, name.trim());
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
        "Apagar este grupo? Só é possível se não existirem partidas associadas. Os membros deixam de estar neste grupo.",
      )
    ) {
      return;
    }
    setDeleting(true);
    setActionError(null);
    try {
      await deleteGroup(id);
      router.push("/groups");
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao apagar.");
    } finally {
      setDeleting(false);
    }
  }

  async function onAddMember() {
    if (!id) {
      return;
    }
    const email = memberEmail.trim();
    if (!email) {
      return;
    }
    setBusyMember("add");
    setActionError(null);
    try {
      await addGroupMember(id, email);
      setMemberEmail("");
      await reload();
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao adicionar membro.");
    } finally {
      setBusyMember(null);
    }
  }

  async function onRemoveMember(userId: string) {
    if (!id) {
      return;
    }
    if (!window.confirm("Remover este utilizador do grupo?")) {
      return;
    }
    setBusyMember(userId);
    setActionError(null);
    try {
      await removeGroupMember(id, userId);
      await reload();
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao remover.");
    } finally {
      setBusyMember(null);
    }
  }

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/groups" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
        <div className="row">
          <button type="submit" form="group-form" className="btn btn-primary" disabled={saving || loading}>
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

      <h1 className="page-title">Editar grupo</h1>

      {loadError ? (
        <p className="alert" role="alert">
          {loadError}
        </p>
      ) : null}
      {loading ? <p className="muted">A carregar…</p> : null}

      {!loading && !loadError ? (
        <>
          <section className="panel-card stack">
            <form id="group-form" className="stack" onSubmit={onSave}>
              <TextField id="ge-name" label="Nome do grupo" value={name} onChange={setName} required />
              {actionError ? (
                <p className="alert" role="alert">
                  {actionError}
                </p>
              ) : null}
            </form>
          </section>

          <section className="panel-card stack">
            <h2 className="section-title">Membros</h2>
            <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <TextField
                id="ge-email"
                label="E-mail do jogador"
                type="email"
                value={memberEmail}
                onChange={setMemberEmail}
              />
              <button
                type="button"
                className="btn btn-primary"
                disabled={busyMember === "add"}
                onClick={() => void onAddMember()}
              >
                {busyMember === "add" ? "…" : "Adicionar"}
              </button>
            </div>
            <ul className="muted" style={{ fontSize: "0.875rem", listStyle: "none", padding: 0 }}>
              {members.length === 0 ? <li>Sem membros.</li> : null}
              {members.map((m) => (
                <li key={m.id} style={{ marginBottom: "0.35rem" }}>
                  {m.user.name} ({m.user.email}){" "}
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}
                    disabled={busyMember === m.userId}
                    onClick={() => void onRemoveMember(m.userId)}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </main>
  );
}
