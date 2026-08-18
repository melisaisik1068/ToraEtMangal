import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await assertAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("Ürün bilgileri geçersiz.");

  const { price, slug, name, ...rest } = parsed.data;
  const data: Prisma.ProductUpdateInput = { ...rest };
  if (name) data.name = name;
  if (name && !slug) data.slug = slugify(name);
  if (slug) data.slug = slugify(slug);
  if (price !== undefined) data.price = new Prisma.Decimal(price.toFixed(2));

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await assertAdmin();
  if (error) return error;
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
