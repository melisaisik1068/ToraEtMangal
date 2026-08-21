import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { assertAdmin, jsonError } from "@/lib/api";

export const runtime = "nodejs";

const MAX_BYTES = 2_500_000;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Geçersiz istek.");

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Dosya seçin.");
  if (!ALLOWED.has(file.type)) return jsonError("Sadece JPG, PNG veya WEBP yükleyin.");
  if (file.size > MAX_BYTES) return jsonError("Dosya en fazla 2.5 MB olabilir.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "images", "menu");

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({ url: `/images/menu/${filename}` });
  } catch {
    // Vercel gibi salt-okunur ortamlarda data URL olarak döndür
    const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;
    if (dataUrl.length > 1_200_000) {
      return jsonError("Dosya çok büyük. Daha küçük bir görsel deneyin.");
    }
    return NextResponse.json({ url: dataUrl });
  }
}
