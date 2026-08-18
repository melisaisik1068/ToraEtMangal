"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

const FIELDS = [
  { key: "name", label: "Restoran adı" },
  { key: "phone", label: "Telefon" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "address", label: "Adres" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "googleMapsUrl", label: "Google Maps URL" },
  { key: "workingHoursWeekdays", label: "Hafta içi saatler" },
  { key: "workingHoursWeekend", label: "Hafta sonu saatler" },
] as const;

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    address: "",
    instagram: "",
    facebook: "",
    googleMapsUrl: "",
    homepageTagline: "",
    aboutText: "",
    workingHoursWeekdays: "",
    workingHoursWeekend: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        const settings = data.settings;
        if (!settings) return;
        const hours = JSON.parse(settings.workingHours ?? "{}") as {
          weekdays?: string;
          weekend?: string;
        };
        setForm({
          name: settings.name,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          address: settings.address,
          instagram: settings.instagram,
          facebook: settings.facebook ?? "",
          googleMapsUrl: settings.googleMapsUrl,
          homepageTagline: settings.homepageTagline,
          aboutText: settings.aboutText,
          workingHoursWeekdays: hours.weekdays ?? "",
          workingHoursWeekend: hours.weekend ?? "",
        });
      });
  }, []);

  return (
    <div>
      <AdminPageHeader title="Ayarlar" subtitle="Restoran bilgileri" />
      <div className="space-y-4">
        {FIELDS.map(({ key, label }) => (
          <AdminCard key={key}>
            <Label>{label}</Label>
            <Input
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </AdminCard>
        ))}
        <AdminCard>
          <Label>Ana sayfa açıklaması</Label>
          <Textarea
            value={form.homepageTagline}
            onChange={(e) => setForm({ ...form, homepageTagline: e.target.value })}
          />
        </AdminCard>
        <AdminCard>
          <Label>Hakkımızda</Label>
          <Textarea value={form.aboutText} onChange={(e) => setForm({ ...form, aboutText: e.target.value })} />
        </AdminCard>
        <Button
          className="min-h-12 w-full"
          onClick={async () => {
            const res = await fetch("/api/admin/settings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            if (res.ok) toast.success("Ayarlar kaydedildi.");
            else toast.error("Hata oluştu.");
          }}
        >
          Kaydet
        </Button>
      </div>
    </div>
  );
}
