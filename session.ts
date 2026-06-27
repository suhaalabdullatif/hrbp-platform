import crypto from "node:crypto";

const SECRET = process.env.SESSION_SECRET;

if (!SECRET) {
  throw new Error("SESSION_SECRET must be set to sign session cookies.");
}

const secret: string = SECRET;

export const SESSION_COOKIE = "hrbp_session";

interface SessionPayload {
  userId: number;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

// Returns a signed cookie value encoding the user id.
export function encodeSession(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ userId } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

// Verifies and decodes a signed cookie value. Returns null when invalid.
export function decodeSession(raw: string | undefined): SessionPayload | null {
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (typeof parsed.userId !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}
