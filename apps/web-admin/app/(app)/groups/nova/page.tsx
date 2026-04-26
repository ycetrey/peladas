"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextField } from "../../../../components/molecules/text-field";
import { createGroup } from "../../../../lib/api";

export default function GroupsNovaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!name.trim()) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createGroup(name.trim());
      router.push("/groups");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar grupo.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="stack">
      <Link href="/groups" className="btn btn-secondary" style={{ textDecoration: "none", width: "fit-content" }}>
        ← Voltar
      </Link>
      <h1 className="page-title">Novo grupo</h1>

      <section className="panel-card stack" style={{ maxWidth: "28rem" }}>
        <form className="stack" onSubmit={onSubmit}>
          <TextField id="g-name" label="Nome do grupo" value={name} onChange={setName} required />
          {error ? (
            <p className="alert" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? "A criar…" : "Criar grupo"}
          </button>
        </form>
      </section>
    </main>
  );
}
