export function decodeBearerToken(token: string) {
  const [payloadB64] = token.split("_");
  if (!payloadB64) throw new Error("Malformed token");
  const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const json = atob(padded);
  return JSON.parse(json);
}
