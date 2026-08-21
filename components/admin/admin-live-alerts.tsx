"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ALERT_BELL_MS, playAlertBell, stopAlertBell } from "@/lib/realtime";
import { useLivePoll } from "@/lib/realtime/use-live-poll";
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

type ReservationAlert = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  note?: string | null;
  status: string;
  createdAt: string;
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
  const [reservations, setReservations] = useState<ReservationAlert[]>([]);
  const knownOrders = useRef<Set<string>>(new Set());
  const knownRequests = useRef<Set<string>>(new Set());
  const knownReservations = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  const pendingCount = useRef(0);

  const tick = useCallback(async () => {
    const [ordersRes, requestsRes, reservationsRes] = await Promise.all([
      fetch("/api/admin/orders?status=PENDING&limit=40"),
      fetch("/api/admin/requests"),
      fetch("/api/admin/reservations"),
    ]);
    if (!ordersRes.ok || !requestsRes.ok || !reservationsRes.ok) return;

    const ordersData = await ordersRes.json();
    const requestsData = await requestsRes.json();
    const reservationsData = await reservationsRes.json();

    const nextOrders = (ordersData.orders ?? []) as OrderAlert[];
    const nextRequests = ((requestsData.requests ?? []) as RequestAlert[]).filter(
      (r) => r.status === "PENDING",
    );
    const nextReservations = ((reservationsData.reservations ?? []) as ReservationAlert[]).filter(
      (r) => r.status === "PENDING",
    );
    const count = nextOrders.length + nextRequests.length + nextReservations.length;
    pendingCount.current = count;

    if (primed.current) {
      let shouldRing = false;
      for (const order of nextOrders) {
        if (!knownOrders.current.has(order.id)) {
          toast.message("Yeni sipariş", {
            description: `Masa ${order.tableNumber ?? "-"} · ${formatTL(order.total)}`,
          });
          shouldRing = true;
        }
      }
      for (const req of nextRequests) {
        if (!knownRequests.current.has(req.id)) {
          toast.message(typeLabel(req.requestType), {
            description: `Masa ${req.table.number}${req.note ? ` · ${req.note}` : ""}`,
          });
          shouldRing = true;
        }
      }
      for (const reservation of nextReservations) {
        if (!knownReservations.current.has(reservation.id)) {
          toast.message("Yeni rezervasyon", {
            description: `${reservation.name} · ${reservation.guests} kişi · ${reservation.time}`,
          });
          shouldRing = true;
        }
      }
      if (shouldRing) playAlertBell(ALERT_BELL_MS);
    }

    knownOrders.current = new Set(nextOrders.map((o) => o.id));
    knownRequests.current = new Set(nextRequests.map((r) => r.id));
    knownReservations.current = new Set(nextReservations.map((r) => r.id));
    primed.current = true;
    setOrders(nextOrders);
    setRequests(nextRequests);
    setReservations(nextReservations);

    if (count === 0) stopAlertBell();
  }, []);

  useLivePoll(tick);

  useLivePoll(() => {
    if (pendingCount.current > 0 && document.visibilityState === "visible") {
      playAlertBell(ALERT_BELL_MS);
    }
  }, ALERT_BELL_MS);

  function maybeStopBell(nextOrders: number, nextRequests: number, nextReservations: number) {
    if (nextOrders + nextRequests + nextReservations === 0) stopAlertBell();
  }

  async function completeRequest(id: string) {
    setRequests((rows) => {
      const next = rows.filter((row) => row.id !== id);
      maybeStopBell(orders.length, next.length, reservations.length);
      return next;
    });
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "COMPLETED" }),
    });
  }

  async function acknowledgeOrder(id: string) {
    setOrders((rows) => {
      const next = rows.filter((row) => row.id !== id);
      maybeStopBell(next.length, requests.length, reservations.length);
      return next;
    });
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "status", status: "CONFIRMED" }),
    });
  }

  async function confirmReservation(id: string) {
    setReservations((rows) => {
      const next = rows.filter((row) => row.id !== id);
      maybeStopBell(orders.length, requests.length, next.length);
      return next;
    });
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CONFIRMED" }),
    });
  }

  if (orders.length === 0 && requests.length === 0 && reservations.length === 0) return null;

  return (
    <div className="print-hidden mb-4 space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
        Aktif bildirimler · kapatılana kadar zil çalar
      </p>

      {reservations.map((reservation) => (
        <article
          key={reservation.id}
          className={cn(
            "rounded-3xl border border-gold bg-gold/10 p-4 shadow-[0_0_24px_rgba(197,160,89,0.15)]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gold">Yeni rezervasyon · {reservation.name}</p>
              <p className="mt-1 text-sm text-cream">
                {new Date(reservation.date).toLocaleDateString("tr-TR")} · {reservation.time} ·{" "}
                {reservation.guests} kişi
              </p>
              <p className="mt-1 text-sm text-muted">{reservation.phone}</p>
              {reservation.note ? <p className="mt-1 text-sm text-muted">Not: {reservation.note}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-primary-foreground"
                onClick={() => confirmReservation(reservation.id)}
              >
                Onayla
              </button>
              <Link href="/admin/reservations" className="text-center text-xs text-gold">
                Liste
              </Link>
            </div>
          </div>
        </article>
      ))}

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
