"use client";

import { useCallback, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { useLivePoll } from "@/lib/realtime/use-live-poll";
import { cn } from "@/lib/utils";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  note?: string | null;
  status: string;
  createdAt?: string;
};

export default function ReservationsPage() {
  const [rows, setRows] = useState<Reservation[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/reservations");
    const data = await res.json();
    setRows(data.reservations ?? []);
  }, []);

  useLivePoll(load);

  const pending = rows.filter((row) => row.status === "PENDING");
  const others = rows.filter((row) => row.status !== "PENDING");

  return (
    <div>
      <AdminPageHeader
        title="Rezervasyonlar"
        subtitle={`${pending.length} bekleyen · ${rows.length} toplam`}
      />

      {pending.length > 0 ? (
        <div className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-gold">Bekleyen talepler</p>
          {pending.map((row) => (
            <AdminCard key={row.id} className="border-gold bg-gold/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-sm text-muted">{row.phone}</p>
                  {row.email ? <p className="text-xs text-muted">{row.email}</p> : null}
                </div>
                <p className="text-sm text-gold">{row.guests} kişi</p>
              </div>
              <p className="mt-2 text-sm">
                {new Date(row.date).toLocaleDateString("tr-TR")} · {row.time}
              </p>
              {row.note ? <p className="mt-1 text-sm text-muted">Not: {row.note}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-primary-foreground"
                  onClick={async () => {
                    await fetch("/api/admin/reservations", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: row.id, status: "CONFIRMED" }),
                    });
                    load();
                  }}
                >
                  Onayla
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-gold/30 px-4 text-sm text-muted"
                  onClick={async () => {
                    await fetch("/api/admin/reservations", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: row.id, status: "CANCELLED" }),
                    });
                    load();
                  }}
                >
                  Reddet
                </button>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : (
        <p className="mb-8 rounded-3xl border border-gold/15 p-6 text-center text-sm text-muted">
          Bekleyen rezervasyon yok.
        </p>
      )}

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Diğer kayıtlar</p>
        {others.map((row) => (
          <AdminCard key={row.id} className={cn(row.status === "CONFIRMED" && "border-gold/30")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-sm text-muted">{row.phone}</p>
              </div>
              <p className="text-sm text-gold">{row.guests} kişi</p>
            </div>
            <p className="mt-2 text-sm">
              {new Date(row.date).toLocaleDateString("tr-TR")} · {row.time}
            </p>
            <select
              className="mt-4 min-h-11 w-full rounded-xl border border-gold/20 bg-background-deep px-3 text-sm"
              value={row.status}
              onChange={async (event) => {
                await fetch("/api/admin/reservations", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: row.id, status: event.target.value }),
                });
                load();
              }}
            >
              <option value="PENDING">Bekliyor</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="SEATED">Oturdu</option>
              <option value="CANCELLED">İptal</option>
              <option value="COMPLETED">Tamamlandı</option>
            </select>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
