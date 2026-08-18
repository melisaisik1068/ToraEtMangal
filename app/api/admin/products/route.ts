import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations";

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return jsonError("Ürün bilgileri geçersiz.");

  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug,
      price: new Prisma.Decimal(parsed.data.price.toFixed(2)),
      isAvailable: parsed.data.isAvailable ?? true,
      isFeatured: parsed.data.isFeatured ?? false,
      hasDoneness: parsed.data.hasDoneness ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ product });
}
