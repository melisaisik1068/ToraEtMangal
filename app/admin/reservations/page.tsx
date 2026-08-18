"use client";

import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: string;
};

export default function ReservationsPage() {
  const [rows, setRows] = useState<Reservation[]>([]);

  function load() {
    fetch("/api/admin/reservations")
      .then((res) => res.json())
      .then((data) => setRows(data.reservations ?? []));
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/reservations")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setRows(data.reservations ?? []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader title="Rezervasyonlar" subtitle={`${rows.length} kayıt`} />
      <div className="space-y-3">
        {rows.map((row) => (
          <AdminCard key={row.id}>
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
