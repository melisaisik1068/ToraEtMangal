"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  Hash,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ORDER_STATUS_LABELS, TRACKING_STEPS } from "@/lib/constants";
import { cookingActive, trackingIndex, type OrderStatusValue } from "@/lib/order-status";
import { ORDER_TRACK_POLL_MS } from "@/lib/realtime";
import { useLivePoll } from "@/lib/realtime/use-live-poll";
import { formatTL } from "@/lib/money";
import { StarRating } from "@/components/reviews/star-rating";
import { cn } from "@/lib/utils";

const STEP_ICONS = [ShoppingBag, ChefHat, Flame, CheckCircle2] as const;

function statusHeadline(status: OrderStatusValue) {
  if (status === "CANCELLED") return "Sipariş iptal edildi";
  if (status === "COMPLETED") return "Ödemeniz tamamlandı!";
  if (status === "SERVED") return "Afiyet olsun!";
  if (status === "READY") return "Siparişiniz hazır!";
  if (status === "PREPARING") return "Siparişiniz pişiriliyor!";
  if (status === "CONFIRMED") return "Siparişiniz onaylandı!";
  return "Siparişiniz alındı!";
}

type OrderView = {
  id: string;
  orderNumber: string;
  status: OrderStatusValue;
  total: string;
  createdAt: string;
  table?: { number: number } | null;
  items: {
    id: string;
    quantity: number;
    unitPrice: string;
    status: OrderStatusValue;
    note?: string | null;
    product: { name: string };
  }[];
};

export function OrderTracker({ initial }: { initial: OrderView }) {
  const [order, setOrder] = useState(initial);
  const step = trackingIndex(order.status);
  const cooking = cookingActive(order.status);
  const terminal = order.status === "COMPLETED" || order.status === "CANCELLED";

  const refresh = useCallback(async () => {
    if (terminal) return;
    const res = await fetch(`/api/orders/${order.id}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
    }
  }, [order.id, terminal]);

  useLivePoll(refresh, ORDER_TRACK_POLL_MS);

  const created = new Date(order.createdAt);
  const etaStart = new Date(created.getTime() + 20 * 60 * 1000);
  const etaEnd = new Date(created.getTime() + 30 * 60 * 1000);

  const meta = [
    { icon: Hash, label: "Sipariş No", value: `#${order.orderNumber}` },
    {
      icon: CalendarDays,
      label: "Tarih",
      value: created.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    },
    {
      icon: Clock,
      label: "Tahmini servis",
      value: `${etaStart.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - ${etaEnd.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`,
    },
    { icon: UtensilsCrossed, label: "Masa No", value: String(order.table?.number ?? "-") },
  ];

  return (
    <div className="px-4 pb-28 pt-6">
      <div className="mb-8 flex justify-center">
        <BrandLogo size={72} />
      </div>

      <p className="text-center text-xs uppercase tracking-[0.28em] text-gold">SİPARİŞ TAKİBİ</p>
      <h1 className="mt-2 text-center font-script text-4xl text-gold">{statusHeadline(order.status)}</h1>
      <p className="mt-2 text-center text-sm text-cream">
        Durum: {ORDER_STATUS_LABELS[order.status] ?? order.status}
      </p>

      <ol className="relative mt-8 grid grid-cols-4 gap-2">
        <span className="absolute top-6 right-8 left-8 h-px bg-gold/25" />
        {TRACKING_STEPS.map((item, index) => {
          const active = cooking ? index === 2 : index === step;
          const done = index < step || (cooking && index < 2) || (step === 3 && index <= 3 && !active && index < 3);
          const Icon = STEP_ICONS[index];
          return (
            <li key={item.key} className="relative text-center">
              <div
                className={cn(
                  "mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-background-deep",
                  active
                    ? "border-gold bg-gold/20 text-gold shadow-[0_0_16px_rgba(197,160,89,0.35)]"
                    : done || step === 3
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-gold/20 text-muted",
                )}
              >
                <Icon className={cn("h-5 w-5", active && index === 2 && "animate-pulse")} />
              </div>
              <p className="mt-2 text-[10px] leading-tight text-muted">{item.label}</p>
            </li>
          );
        })}
      </ol>

      <section className="mt-10 rounded-3xl border border-gold/20 bg-card/60 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-gold">ÜRÜNLER</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.items.map((item) => {
            const itemStatus = item.status ?? order.status;
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-gold/15 bg-background-deep/40 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-cream">
                      {item.product.name} × {item.quantity}
                    </p>
                    {item.note ? <p className="mt-0.5 text-xs text-muted">{item.note}</p> : null}
                  </div>
                  <span className="shrink-0 text-gold">{formatTL(item.unitPrice)}</span>
                </div>
                <p
                  className={cn(
                    "mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]",
                    itemStatus === "READY" || itemStatus === "SERVED"
                      ? "border-emerald-400/40 text-emerald-200"
                      : itemStatus === "CANCELLED"
                        ? "border-destructive/40 text-destructive"
                        : "border-gold/40 text-gold",
                  )}
                >
                  {ORDER_STATUS_LABELS[itemStatus] ?? itemStatus}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 flex justify-between border-t border-gold/15 pt-4 text-base font-semibold">
          TOPLAM <span className="text-xl text-gold">{formatTL(order.total)}</span>
        </p>
      </section>

      <section className="mt-4 space-y-3 rounded-3xl border border-gold/20 bg-card/60 p-5 text-sm">
        {meta.map((item) => (
          <div key={item.label} className="flex items-start gap-3 border-b border-gold/10 pb-3 last:border-0 last:pb-0">
            <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{item.label}</p>
              <p className="text-cream">{item.value}</p>
            </div>
          </div>
        ))}
      </section>

      <StarRating
        onSubmit={async (rating) => {
          const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id, rating }),
          });
          if (res.ok) toast.success("Değerlendirmeniz alındı.");
          else toast.error("Hata oluştu.");
        }}
      />
    </div>
  );
}
