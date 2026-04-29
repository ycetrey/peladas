function b64UrlToBytes(s: string): Uint8Array {
  let b = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b.length % 4;
  if (pad) {
    b += "=".repeat(4 - pad);
  }
  const bin = atob(b);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function verifyJwtHs256(
  token: string,
  secret: Uint8Array,
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [h, p, sigB64] = parts;
  if (!h || !p || !sigB64) {
    return null;
  }
  const data = new TextEncoder().encode(`${h}.${p}`);
  const signature = b64UrlToBytes(sigB64);
  const key = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const ok = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!ok) {
    return null;
  }
  try {
    const json = new TextDecoder().decode(b64UrlToBytes(p));
    const payload = JSON.parse(json) as Record<string, unknown>;
    const exp = payload.exp;
    if (typeof exp === "number" && exp < Date.now() / 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
