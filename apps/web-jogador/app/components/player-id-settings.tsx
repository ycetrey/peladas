"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "peladas_player_user_id";

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PLAYER_ID_CHANGED = "peladas_player_user_id_changed";

export function PlayerIdSettings() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setValue(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  function save() {
    setError(null);
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Indica um UUID.");
      return;
    }
    if (!uuidRe.test(trimmed)) {
      setError("UUID inválido (deve ser UUID v1–v5).");
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setValue(trimmed);
      window.dispatchEvent(new CustomEvent(PLAYER_ID_CHANGED, { detail: trimmed }));
    } catch {
      setError("Não foi possível guardar.");
    }
  }

  return (
    <div className="player-id-settings stack" style={{ minWidth: "12rem", flex: "1 1 14rem" }}>
      <label htmlFor="peladas-player-id" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
        O teu ID (UUID)
      </label>
      <div className="row">
        <input
          id="peladas-player-id"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(ev) => setValue(ev.target.value)}
          placeholder="00000000-0000-4000-8000-000000000002"
          style={{ flex: "1 1 12rem", minWidth: 0, padding: "0.375rem 0.5rem" }}
        />
        <button type="button" className="btn btn-primary" onClick={save}>
          Guardar
        </button>
      </div>
      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function readPlayerUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)?.trim();
    if (!raw || !uuidRe.test(raw)) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}
