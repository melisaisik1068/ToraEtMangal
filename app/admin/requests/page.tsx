"use client";

import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";

type RequestRow = {
  id: string;
  requestType: string;
  status: string;
  createdAt: string;
  table: { number: number };
};

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);

  function load() {
    fetch("/api/admin/requests")
      .then((res) => res.json())
      .then((data) => setRows(data.requests ?? []));
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/requests")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setRows(data.requests ?? []);
      });
    const timer = setInterval(() => {
      fetch("/api/admin/requests")
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setRows(data.requests ?? []);
        });
    }, 7000);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <div>
      <AdminPageHeader title="Garson talepleri" subtitle="Canlı masa çağrıları" />
      <div className="space-y-3">
        {rows.map((row) => (
          <AdminCard key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  Masa {row.table.number} ·{" "}
                  {row.requestType === "BILL"
                    ? "Hesap"
                    : row.requestType === "WAITER"
                      ? "Garson"
                      : row.requestType}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(row.createdAt).toLocaleTimeString("tr-TR")} · {row.status}
                </p>
              </div>
              {row.status === "PENDING" ? (
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
              ) : null}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
