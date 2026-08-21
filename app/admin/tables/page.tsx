"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { useLivePoll } from "@/lib/realtime/use-live-poll";
import { formatTL } from "@/lib/money";
import { cn } from "@/lib/utils";

type TableStatus = {
  id: string;
  number: number;
  isActive: boolean;
  qrUrl: string;
  hasOrder: boolean;
  orderCount: number;
  currentOrder: null | {
    id: string;
    orderNumber: string;
    status: string;
    total: string;
    note: string | null;
    createdAt: string;
    items: { name: string; quantity: number; status: string }[];
  };
};

const STATUS_TONE: Record<string, string> = {
  PENDING: "border-gold bg-gold/15 text-gold",
  CONFIRMED: "border-gold/50 bg-gold/10 text-gold",
  PREPARING: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  READY: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  SERVED: "border-sky-400/40 bg-sky-400/10 text-sky-200",
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [filter, setFilter] = useState<"all" | "busy" | "empty">("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/tables/status");
    const data = await res.json();
    setTables(data.tables ?? []);
  }, []);

  useLivePoll(load);

  async function markPaid(orderId: string, tableNumber: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.currentOrder?.id === orderId
          ? { ...table, hasOrder: false, orderCount: Math.max(0, table.orderCount - 1), currentOrder: null }
          : table,
      ),
    );
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    if (!res.ok) {
      toast.error("Hesap kapatılamadı.");
      await load();
      return;
    }
    toast.success(`Masa ${tableNumber} hesabı kapatıldı.`);
  }

  const busy = tables.filter((t) => t.hasOrder).length;
  const empty = tables.length - busy;
  const visible = tables.filter((table) => {
    if (filter === "busy") return table.hasOrder;
    if (filter === "empty") return !table.hasOrder;
    return true;
  });

  return (
    <div>
      <AdminPageHeader
        title="Masalar"
        subtitle={`${busy} dolu · ${empty} boş · ödeme bitince masa temizlenir`}
        action={
          <>
            <Link
              href="/admin/qr"
              className="inline-flex min-h-11 items-center rounded-full border border-gold/40 px-4 text-sm"
            >
              QR yönetimi
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex min-h-11 items-center rounded-full border border-gold/40 px-4 text-sm"
            >
              Siparişler
            </Link>
          </>
        }
      />

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {(
          [
            ["all", `Tümü (${tables.length})`],
            ["busy", `Dolu (${busy})`],
            ["empty", `Boş (${empty})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm",
              filter === key ? "border-gold bg-gold text-primary-foreground" : "border-gold/25 text-cream",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((table) => {
          const order = table.currentOrder;
          return (
            <AdminCard
              key={table.id}
              className={cn(order ? "border-gold/40 bg-gold/5" : "opacity-90")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-serif text-2xl">Masa {table.number}</p>
                  <p className={cn("mt-1 text-xs uppercase tracking-[0.16em]", order ? "text-gold" : "text-muted")}>
                    {order ? "Sipariş var" : "Boş / hazır"}
                  </p>
                </div>
                {order ? (
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide",
                      STATUS_TONE[order.status] ?? "border-gold/30 text-muted",
                    )}
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                ) : (
                  <span className="rounded-full border border-gold/20 px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted">
                    Müsait
                  </span>
                )}
              </div>

              {order ? (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-cream">#{order.orderNumber}</p>
                  <ul className="space-y-1 text-sm text-muted">
                    {order.items.map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {item.name} ×{item.quantity}
                        <span className="text-gold">
                          {" "}
                          · {ORDER_STATUS_LABELS[item.status] ?? item.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {order.note ? <p className="text-xs text-gold">Not: {order.note}</p> : null}
                  <p className="text-base font-semibold text-gold">{formatTL(order.total)}</p>
                  <p className="text-[11px] text-muted">
                    {new Date(order.createdAt).toLocaleTimeString("tr-TR")}
                    {table.orderCount > 1 ? ` · +${table.orderCount - 1} açık sipariş` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex min-h-10 items-center rounded-full border border-gold/30 px-3 text-xs text-gold"
                    >
                      Detay
                    </Link>
                    {order.status === "SERVED" || order.status === "READY" ? (
                      <button
                        type="button"
                        className="inline-flex min-h-10 items-center rounded-full bg-gold px-3 text-xs font-semibold text-primary-foreground"
                        onClick={() => markPaid(order.id, table.number)}
                      >
                        Ödeme tamamlandı
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex min-h-10 items-center rounded-full border border-gold/30 px-3 text-xs text-cream"
                        onClick={() => markPaid(order.id, table.number)}
                      >
                        Hesabı kapat
                      </button>
                    )}
                    <a
                      href={table.qrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center rounded-full border border-gold/20 px-3 text-xs text-muted"
                    >
                      QR aç
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-muted">Aktif sipariş yok. Yeni müşteri için masa hazır.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center rounded-full border border-gold/30 px-3 text-xs"
                      onClick={async () => {
                        await navigator.clipboard.writeText(table.qrUrl);
                        toast.success(`Masa ${table.number} linki kopyalandı.`);
                      }}
                    >
                      Link kopyala
                    </button>
                    <Link
                      href={`/admin/tables/${table.number}/print`}
                      className="inline-flex min-h-10 items-center rounded-full border border-gold/30 px-3 text-xs text-gold"
                    >
                      QR yazdır
                    </Link>
                  </div>
                </div>
              )}
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
