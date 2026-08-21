"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { LIVE_POLL_INTERVAL_MS } from "@/lib/realtime";
import { formatTL } from "@/lib/money";
import { cn } from "@/lib/utils";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  note?: string | null;
  tableNumber: number | null;
  items: { name: string; quantity: number; note?: string | null }[];
};

const TABS = [
  { key: "PENDING", label: "Yeni" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "READY", label: "Servise Hazır" },
  { key: "COMPLETED", label: "Tamamlandı" },
] as const;

const NEXT: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
  SERVED: "COMPLETED",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("PENDING");

  function load() {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders((data.orders ?? []) as OrderRow[]));
  }

  useEffect(() => {
    let ignore = false;
    const tick = () => {
      fetch("/api/admin/orders")
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setOrders((data.orders ?? []) as OrderRow[]);
        });
    };
    tick();
    const timer = setInterval(tick, LIVE_POLL_INTERVAL_MS);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, []);

  async function advance(order: OrderRow) {
    const status = NEXT[order.status];
    if (!status) return;
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = orders.filter((order) => {
    if (tab === "COMPLETED") return ["SERVED", "COMPLETED"].includes(order.status);
    if (tab === "PREPARING") return ["CONFIRMED", "PREPARING"].includes(order.status);
    return order.status === tab;
  });

  return (
    <div>
      <AdminPageHeader title="Siparişler" subtitle="Masa · ürün · not takibi" />
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm",
              tab === item.key ? "border-gold bg-gold text-primary-foreground" : "border-gold/25 text-cream",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((order) => (
          <AdminCard
            key={order.id}
            className={order.status === "PENDING" ? "border-gold bg-gold/10" : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-sm text-gold">Masa {order.tableNumber ?? "-"}</p>
              </div>
              <p className="text-gold">{formatTL(order.total)}</p>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-cream">
              {order.items.map((item, index) => (
                <li key={`${order.id}-${index}`}>
                  {item.name} ×{item.quantity}
                  {item.note ? <span className="text-muted"> · {item.note}</span> : null}
                </li>
              ))}
            </ul>
            {order.note ? <p className="mt-2 text-sm text-muted">Sipariş notu: {order.note}</p> : null}
            <p className="mt-2 text-xs text-muted">
              {new Date(order.createdAt).toLocaleTimeString("tr-TR")}
            </p>
            <div className="mt-4 flex gap-3 text-sm">
              <Link href={`/admin/orders/${order.id}`} className="text-gold">
                Detay
              </Link>
              {NEXT[order.status] ? (
                <button type="button" className="text-cream" onClick={() => advance(order)}>
                  İlerlet
                </button>
              ) : null}
            </div>
          </AdminCard>
        ))}
        {filtered.length === 0 ? (
          <p className="rounded-3xl border border-gold/15 p-6 text-center text-sm text-muted">
            Bu durumda sipariş yok.
          </p>
        ) : null}
      </div>
    </div>
  );
}
