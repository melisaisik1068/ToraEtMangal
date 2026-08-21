"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { useLivePoll } from "@/lib/realtime/use-live-poll";
import { formatTL } from "@/lib/money";
import { cn } from "@/lib/utils";

type OrderItemRow = {
  id: string;
  name: string;
  quantity: number;
  note?: string | null;
  status: string;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  note?: string | null;
  tableNumber: number | null;
  items: OrderItemRow[];
};

const TABS = [
  { key: "PENDING", label: "Yeni" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "READY", label: "Servise Hazır" },
  { key: "SERVED", label: "Servis Edildi" },
  { key: "COMPLETED", label: "Ödemesi Tamamlandı" },
  { key: "CANCELLED", label: "İptal" },
] as const;

const ITEM_STATUS_ACTIONS = [
  { key: "PENDING", label: "Alındı" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "READY", label: "Hazır" },
  { key: "SERVED", label: "Servis" },
  { key: "CANCELLED", label: "İptal" },
] as const;

const NEXT_ITEM_STATUS: Record<string, string> = {
  PENDING: "PREPARING",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

function matchesTab(order: OrderRow, tab: string) {
  if (tab === "COMPLETED") return order.status === "COMPLETED";
  if (tab === "CANCELLED") {
    return order.status === "CANCELLED" || order.items.every((item) => item.status === "CANCELLED");
  }
  if (tab === "PENDING") {
    return order.items.some((item) => item.status === "PENDING");
  }
  if (tab === "PREPARING") {
    return order.items.some(
      (item) => item.status === "CONFIRMED" || item.status === "PREPARING",
    );
  }
  return order.items.some((item) => item.status === tab);
}

function isItemStatusActive(itemStatus: string, actionKey: string) {
  if (actionKey === "PREPARING") return itemStatus === "CONFIRMED" || itemStatus === "PREPARING";
  return itemStatus === actionKey;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("PENDING");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders((data.orders ?? []) as OrderRow[]);
    setLoaded(true);
  }, []);

  useLivePoll(load);

  async function setItemStatus(orderId: string, itemId: string, status: string) {
    setSavingKey(itemId);
    setOrders((prev) =>
      prev.map((order) =>
        order.id !== orderId
          ? order
          : {
              ...order,
              items: order.items.map((item) =>
                item.id === itemId ? { ...item, status } : item,
              ),
            },
      ),
    );
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "itemStatus", itemId, status }),
    });
    setSavingKey(null);
    if (!res.ok) {
      toast.error("Ürün durumu güncellenemedi.");
      await load();
      return;
    }
    const data = await res.json().catch(() => null);
    if (data?.order) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.order.status,
                total: String(data.order.total),
                items: data.order.items.map(
                  (item: {
                    id: string;
                    quantity: number;
                    note: string | null;
                    status: string;
                    product: { name: string };
                  }) => ({
                    id: item.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    note: item.note,
                    status: item.status,
                  }),
                ),
              }
            : order,
        ),
      );
    }
    toast.success(ORDER_STATUS_LABELS[status] ?? status);
  }

  async function markPaid(orderId: string) {
    setSavingKey(orderId);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "COMPLETED",
              items: order.items.map((item) =>
                item.status === "CANCELLED" ? item : { ...item, status: "SERVED" },
              ),
            }
          : order,
      ),
    );
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "status", status: "COMPLETED" }),
    });
    setSavingKey(null);
    if (!res.ok) {
      toast.error("Ödeme işaretlenemedi.");
      await load();
      return;
    }
    toast.success("Ödemesi tamamlandı");
  }

  const visible = orders.filter((order) => matchesTab(order, tab));

  return (
    <div>
      <AdminPageHeader
        title="Siparişler"
        subtitle="Tek dokunuşla sonraki adım · ürün durumu anında güncellenir"
      />
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
        {!loaded ? (
          <>
            <div className="h-40 animate-pulse rounded-3xl bg-white/5" />
            <div className="h-40 animate-pulse rounded-3xl bg-white/5" />
          </>
        ) : null}
        {visible.map((order) => (
          <AdminCard
            key={order.id}
            className={
              order.items.some((item) => item.status === "PENDING") ? "border-gold bg-gold/10" : undefined
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-sm text-gold">Masa {order.tableNumber ?? "-"}</p>
                <p className="mt-1 text-xs text-muted">
                  Sipariş: {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </p>
              </div>
              <p className="text-gold">{formatTL(order.total)}</p>
            </div>

            {order.note ? <p className="mt-2 text-sm text-muted">Sipariş notu: {order.note}</p> : null}
            <p className="mt-2 text-xs text-muted">
              {new Date(order.createdAt).toLocaleTimeString("tr-TR")}
            </p>

            <div className="mt-4 space-y-3">
              {order.items.map((item) => {
                const next = NEXT_ITEM_STATUS[item.status];
                return (
                  <div key={item.id} className="rounded-2xl border border-gold/20 bg-background-deep/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-cream">
                          {item.name} ×{item.quantity}
                        </p>
                        {item.note ? <p className="text-xs text-muted">{item.note}</p> : null}
                        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-gold">
                          {ORDER_STATUS_LABELS[item.status] ?? item.status}
                        </p>
                      </div>
                      {order.status !== "COMPLETED" && next ? (
                        <button
                          type="button"
                          disabled={savingKey === item.id}
                          onClick={() => setItemStatus(order.id, item.id, next)}
                          className="min-h-10 shrink-0 rounded-full bg-gold px-3 text-xs font-semibold text-primary-foreground"
                        >
                          {ORDER_STATUS_LABELS[next] ?? next}
                        </button>
                      ) : null}
                    </div>
                    {order.status !== "COMPLETED" ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {ITEM_STATUS_ACTIONS.map((status) => {
                          const active = isItemStatusActive(item.status, status.key);
                          return (
                            <button
                              key={status.key}
                              type="button"
                              disabled={savingKey === item.id}
                              onClick={() => setItemStatus(order.id, item.id, status.key)}
                              className={cn(
                                "min-h-9 rounded-full border px-2.5 text-[11px]",
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
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {order.status !== "COMPLETED" && order.status !== "CANCELLED" ? (
                <button
                  type="button"
                  disabled={savingKey === order.id}
                  onClick={() => markPaid(order.id)}
                  className="min-h-11 rounded-full bg-gold px-4 text-xs font-semibold text-primary-foreground"
                >
                  Ödemesi tamamlandı
                </button>
              ) : null}
              <Link href={`/admin/orders/${order.id}`} className="min-h-11 inline-flex items-center text-sm text-gold">
                Detay / ürün ekle
              </Link>
            </div>
          </AdminCard>
        ))}
        {loaded && visible.length === 0 ? (
          <p className="rounded-3xl border border-gold/15 p-6 text-center text-sm text-muted">
            Bu durumda sipariş yok.
          </p>
        ) : null}
      </div>
    </div>
  );
}
