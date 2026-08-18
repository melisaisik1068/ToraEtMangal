import { NextResponse } from "next/server";
import { authenticateAdmin, setSessionCookie } from "@/lib/auth";
import { clientKey, jsonError } from "@/lib/api";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "login"), RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs);
  if (!limited.success) return jsonError("Çok fazla deneme. Lütfen sonra tekrar deneyin.", 429);

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError("E-posta veya şifre geçersiz.");

  const result = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!result) return jsonError("E-posta veya şifre hatalı.", 401);

  await setSessionCookie(result.token);
  return NextResponse.json({ ok: true, name: result.user.name });
}
