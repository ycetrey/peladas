export function getInternalApiBaseUrl(): string {
  const fromEnv =
    process.env.API_INTERNAL_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}
