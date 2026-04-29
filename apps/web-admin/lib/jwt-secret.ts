export function getJwtSecretKey(): Uint8Array {
  const s = process.env.JWT_SECRET ?? "dev-only-change-me-in-production";
  return new TextEncoder().encode(s);
}
