import { jwtVerify, SignJWT } from "jose";
import { SESSION_COOKIE } from "@/lib/constants";

export type SessionPayload = {
  sub: string;
  email: string;
  role: "ADMIN" | "STAFF";
  name: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET en az 16 karakter olmalıdır.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: payload.role === "STAFF" ? "STAFF" : "ADMIN",
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export const COOKIE_OPTIONS = {
  name: SESSION_COOKIE,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
