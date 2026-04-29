"use client";

import { useEffect, useRef } from "react";

/**
 * Executa `onTick` de forma periódica só com o separador visível.
 * Quando `intervalMs` é `null`, não agenda timer.
 * Ao voltar a `visible`, corre `onTick` uma vez (dados frescos após ausência).
 */
export function useVisibilityPolling(
  onTick: () => void,
  intervalMs: number | null,
): void {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (intervalMs === null || intervalMs <= 0) {
      return;
    }

    let id: ReturnType<typeof setInterval> | undefined;

    const runIfVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      onTickRef.current();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        onTickRef.current();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    id = setInterval(runIfVisible, intervalMs);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (id !== undefined) {
        clearInterval(id);
      }
    };
  }, [intervalMs]);
}
