import { NextResponse } from "next/server";
import { assertAdmin, jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  const { error } = await assertAdmin();
  if (error) return error;
  const settings = await prisma.restaurantSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const { error } = await assertAdmin();
  if (error) return error;
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Ayarlar geçersiz.");
  const settings = await prisma.restaurantSettings.upsert({
    where: { id: "default" },
    update: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      address: parsed.data.address,
      instagram: parsed.data.instagram,
      facebook: parsed.data.facebook ?? "",
      googleMapsUrl: parsed.data.googleMapsUrl,
      homepageTagline: parsed.data.homepageTagline,
      aboutText: parsed.data.aboutText,
      workingHours: JSON.stringify({
        weekdays: parsed.data.workingHoursWeekdays,
        weekend: parsed.data.workingHoursWeekend,
      }),
    },
    create: {
      id: "default",
      name: parsed.data.name,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      address: parsed.data.address,
      instagram: parsed.data.instagram,
      facebook: parsed.data.facebook ?? "",
      googleMapsUrl: parsed.data.googleMapsUrl,
      homepageTagline: parsed.data.homepageTagline,
      aboutText: parsed.data.aboutText,
      logo: "/images/logo/logo.png",
      workingHours: JSON.stringify({
        weekdays: parsed.data.workingHoursWeekdays,
        weekend: parsed.data.workingHoursWeekend,
      }),
    },
  });
  return NextResponse.json({ settings });
}
