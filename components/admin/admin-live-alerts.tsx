"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LIVE_POLL_INTERVAL_MS, playAlertBell } from "@/lib/realtime";
import { formatTL } from "@/lib/money";
import { cn } from "@/lib/utils";

type OrderAlert = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  note?: string | null;
  tableNumber: number | null;
  items: { name: string; quantity: number }[];
  createdAt: string;
};

type RequestAlert = {
  id: string;
  requestType: string;
  status: string;
  note?: string | null;
  createdAt: string;
  table: { number: number };
};

function typeLabel(type: string) {
  if (type === "BILL") return "Hesap isteği";
  if (type === "WAITER") return "Garson çağrısı";
  if (type === "WATER") return "Su talebi";
  return type;
}

export function AdminLiveAlerts() {
  const [orders, setOrders] = useState<OrderAlert[]>([]);
  const [requests, setRequests] = useState<RequestAlert[]>([]);
  const knownOrders = useRef<Set<string>>(new Set());
  const knownRequests = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    let ignore = false;

    const tick = async () => {
      const [ordersRes, requestsRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/requests"),
      ]);
      if (!ordersRes.ok || !requestsRes.ok) return;
      const ordersData = await ordersRes.json();
      const requestsData = await requestsRes.json();
      if (ignore) return;

      const nextOrders = (ordersData.orders ?? []) as OrderAlert[];
      const nextRequests = (requestsData.requests ?? []) as RequestAlert[];

      if (primed.current) {
        for (const order of nextOrders) {
          if (!knownOrders.current.has(order.id) && order.status === "PENDING") {
            toast.message("Yeni sipariş", {
              description: `Masa ${order.tableNumber ?? "-"} · ${formatTL(order.total)}`,
            });
            playAlertBell(5000);
          }
        }
        for (const req of nextRequests) {
          if (!knownRequests.current.has(req.id) && req.status === "PENDING") {
            toast.message(typeLabel(req.requestType), {
              description: `Masa ${req.table.number}${req.note ? ` · ${req.note}` : ""}`,
            });
            playAlertBell(5000);
          }
        }
      }

      knownOrders.current = new Set(nextOrders.map((o) => o.id));
      knownRequests.current = new Set(nextRequests.map((r) => r.id));
      primed.current = true;
      setOrders(nextOrders.filter((o) => o.status === "PENDING"));
      setRequests(nextRequests.filter((r) => r.status === "PENDING"));
    };

    tick();
    const timer = setInterval(tick, LIVE_POLL_INTERVAL_MS);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, []);

  async function completeRequest(id: string) {
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "COMPLETED" }),
    });
    setRequests((rows) => rows.filter((row) => row.id !== id));
  }

  async function acknowledgeOrder(id: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    setOrders((rows) => rows.filter((row) => row.id !== id));
  }

  if (orders.length === 0 && requests.length === 0) return null;

  return (
    <div className="print-hidden mb-4 space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Aktif bildirimler</p>
      {requests.map((req) => (
        <article
          key={req.id}
          className={cn(
            "rounded-3xl border border-gold bg-gold/10 p-4 shadow-[0_0_24px_rgba(197,160,89,0.15)]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gold">
                Masa {req.table.number} · {typeLabel(req.requestType)}
              </p>
              {req.note ? <p className="mt-1 text-sm text-cream">Not: {req.note}</p> : null}
              <p className="mt-1 text-xs text-muted">
                {new Date(req.createdAt).toLocaleTimeString("tr-TR")}
              </p>
            </div>
            <button
              type="button"
              className="min-h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-primary-foreground"
              onClick={() => completeRequest(req.id)}
            >
              Tamamla
            </button>
          </div>
        </article>
      ))}
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-3xl border border-gold bg-gold/10 p-4 shadow-[0_0_24px_rgba(197,160,89,0.15)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gold">
                Yeni sipariş · Masa {order.tableNumber ?? "-"} · #{order.orderNumber}
              </p>
              <p className="mt-1 text-sm text-cream">
                {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
              </p>
              {order.note ? <p className="mt-1 text-sm text-muted">Not: {order.note}</p> : null}
              <p className="mt-1 text-sm text-gold">{formatTL(order.total)}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-primary-foreground"
                onClick={() => acknowledgeOrder(order.id)}
              >
                Onayla
              </button>
              <Link href={`/admin/orders/${order.id}`} className="text-center text-xs text-gold">
                Detay
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
