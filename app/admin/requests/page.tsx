"use client";

import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { LIVE_POLL_INTERVAL_MS } from "@/lib/realtime";

type RequestRow = {
  id: string;
  requestType: string;
  status: string;
  note?: string | null;
  createdAt: string;
  table: { number: number };
};

function typeLabel(type: string) {
  if (type === "BILL") return "Hesap";
  if (type === "WAITER") return "Garson";
  if (type === "WATER") return "Su";
  return type;
}

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);

  function load() {
    fetch("/api/admin/requests")
      .then((res) => res.json())
      .then((data) => setRows((data.requests ?? []) as RequestRow[]));
  }

  useEffect(() => {
    let ignore = false;
    const tick = () => {
      fetch("/api/admin/requests")
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setRows((data.requests ?? []) as RequestRow[]);
        });
    };
    tick();
    const timer = setInterval(tick, LIVE_POLL_INTERVAL_MS);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, []);

  const pending = rows.filter((row) => row.status === "PENDING");
  const done = rows.filter((row) => row.status !== "PENDING");

  return (
    <div>
      <AdminPageHeader title="Garson talepleri" subtitle="Tamamlanana kadar bildirimde kalır" />
      <div className="space-y-3">
        {pending.map((row) => (
          <AdminCard key={row.id} className="border-gold bg-gold/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  Masa {row.table.number} · {typeLabel(row.requestType)}
                </p>
                {row.note ? <p className="mt-1 text-sm text-cream">Not: {row.note}</p> : null}
                <p className="mt-1 text-xs text-muted">
                  {new Date(row.createdAt).toLocaleTimeString("tr-TR")} · Bekliyor
                </p>
              </div>
              <button
                type="button"
                className="min-h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-primary-foreground"
                onClick={async () => {
                  await fetch("/api/admin/requests", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: row.id, status: "COMPLETED" }),
                  });
                  load();
                }}
              >
                Tamamla
              </button>
            </div>
          </AdminCard>
        ))}
        {pending.length === 0 ? (
          <p className="rounded-3xl border border-gold/15 p-6 text-center text-sm text-muted">
            Bekleyen çağrı yok.
          </p>
        ) : null}
      </div>

      {done.length > 0 ? (
        <div className="mt-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Tamamlananlar</p>
          {done.slice(0, 12).map((row) => (
            <AdminCard key={row.id}>
              <p className="text-sm text-muted">
                Masa {row.table.number} · {typeLabel(row.requestType)} ·{" "}
                {new Date(row.createdAt).toLocaleTimeString("tr-TR")}
              </p>
              {row.note ? <p className="mt-1 text-xs text-muted">Not: {row.note}</p> : null}
            </AdminCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
