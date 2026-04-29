"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TextField } from "../../../components/molecules/text-field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!cancelled && res.ok) {
          const body = (await res.json()) as { user?: { isAdmin?: boolean } };
          if (body.user?.isAdmin) {
            router.replace("/");
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "Credenciais inválidas ou sem permissão de admin.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-main">
      <h1 className="page-title">Admin — Peladas</h1>
      <p className="muted">
        Conta com <code>isAdmin</code> (ex.: seed <code>admin@peladas.local</code> /{" "}
        <code>password</code>).
      </p>
      <form className="stack" onSubmit={onSubmit}>
        <TextField
          id="admin-login-email"
          label="Email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={setEmail}
          required
        />
        <TextField
          id="admin-login-password"
          label="Palavra-passe"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          required
        />
        {error ? (
          <p className="alert" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "A entrar…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
