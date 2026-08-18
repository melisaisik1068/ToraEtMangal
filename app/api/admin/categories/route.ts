import { NextResponse } from "next/server";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;
  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Kategori geçersiz.");
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name),
      sortOrder: parsed.data.sortOrder ?? 0,
      isActive: parsed.data.isActive ?? true,
    },
  });
  return NextResponse.json({ category });
}

export async function PATCH(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;
  const body = await request.json().catch(() => null);
  if (!body?.id) return jsonError("Kategori id gerekli.");
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("Kategori geçersiz.");
  const category = await prisma.category.update({
    where: { id: body.id },
    data: {
      ...parsed.data,
      slug: parsed.data.slug ? slugify(parsed.data.slug) : parsed.data.name ? slugify(parsed.data.name) : undefined,
    },
  });
  return NextResponse.json({ category });
}

export async function DELETE(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;
  const { id } = await request.json().catch(() => ({ id: null }));
  if (!id) return jsonError("Kategori id gerekli.");
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
