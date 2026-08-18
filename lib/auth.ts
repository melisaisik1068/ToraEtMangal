import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  COOKIE_OPTIONS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_OPTIONS.name)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "ADMIN" && session.role !== "STAFF") return null;
  return session;
}

export async function authenticateAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  return { user, token };
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_OPTIONS.name, token, COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE_OPTIONS.name, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}
