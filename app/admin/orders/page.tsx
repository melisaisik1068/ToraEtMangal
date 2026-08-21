"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
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
  { key: "SERVED", label: "Servis Edildi" },
  { key: "COMPLETED", label: "Ödemesi Tamamlandı" },
  { key: "CANCELLED", label: "İptal" },
] as const;

const STATUS_ACTIONS = [
  { key: "PENDING", label: "Sipariş Alındı" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "READY", label: "Servise Hazır" },
  { key: "SERVED", label: "Servis Edildi" },
  { key: "COMPLETED", label: "Ödemesi Tamamlandı" },
  { key: "CANCELLED", label: "İptal" },
] as const;

function matchesTab(status: string, tab: string) {
  if (tab === "PENDING") return status === "PENDING";
  if (tab === "PREPARING") return status === "CONFIRMED" || status === "PREPARING";
  return status === tab;
}

function isStatusActive(orderStatus: string, actionKey: string) {
  if (actionKey === "PREPARING") return orderStatus === "CONFIRMED" || orderStatus === "PREPARING";
  return orderStatus === actionKey;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("PENDING");
  const [savingId, setSavingId] = useState<string | null>(null);

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

  async function setStatus(order: OrderRow, status: string) {
    if (isStatusActive(order.status, status) && !(status === "PREPARING" && order.status === "CONFIRMED")) {
      if (order.status === status) return;
      if (status === "PREPARING" && (order.status === "PREPARING" || order.status === "CONFIRMED")) return;
    }
    setSavingId(order.id);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSavingId(null);
    if (!res.ok) {
      toast.error("Durum güncellenemedi.");
      return;
    }
    toast.success(ORDER_STATUS_LABELS[status] ?? status);
    load();
  }

  const visible = orders.filter((order) => matchesTab(order.status, tab));

  return (
    <div>
      <AdminPageHeader title="Siparişler" subtitle="Duruma tıkla · müşteri ekranı anında güncellenir" />
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
        {visible.map((order) => (
          <AdminCard
            key={order.id}
            className={order.status === "PENDING" ? "border-gold bg-gold/10" : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-sm text-gold">Masa {order.tableNumber ?? "-"}</p>
                <p className="mt-1 text-xs text-muted">
                  Şu an: {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </p>
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

            <div className="mt-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-gold">Durumu seç</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.map((status) => {
                  const active = isStatusActive(order.status, status.key);
                  return (
                    <button
                      key={status.key}
                      type="button"
                      disabled={savingId === order.id}
                      onClick={() => setStatus(order, status.key)}
                      className={cn(
                        "min-h-10 rounded-full border px-3 text-xs",
                        active
                          ? status.key === "CANCELLED"
                            ? "border-destructive bg-destructive/20 font-semibold text-destructive"
                            : "border-gold bg-gold font-semibold text-primary-foreground"
                          : status.key === "CANCELLED"
                            ? "border-destructive/40 text-destructive"
                            : "border-gold/30 text-cream hover:border-gold/60",
                      )}
                    >
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3">
              <Link href={`/admin/orders/${order.id}`} className="text-sm text-gold">
                Detay
              </Link>
            </div>
          </AdminCard>
        ))}
        {visible.length === 0 ? (
          <p className="rounded-3xl border border-gold/15 p-6 text-center text-sm text-muted">
            Bu durumda sipariş yok.
          </p>
        ) : null}
      </div>
    </div>
  );
}
