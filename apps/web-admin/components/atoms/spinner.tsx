export function Spinner({ label = "A carregar" }: { label?: string }) {
  return (
    <p className="muted" role="status" aria-live="polite">
      {label}…
    </p>
  );
}
