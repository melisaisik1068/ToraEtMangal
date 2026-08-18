import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function assertAdmin() {
  const session = await requireAdmin();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Yetkisiz." }, { status: 401 }) };
  }
  return { session, error: null };
}

export function clientKey(request: Request, prefix: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${prefix}:${ip}`;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
