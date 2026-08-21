"use client";

import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { formatTL } from "@/lib/money";
import { cn } from "@/lib/utils";

type ProductRank = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

type PeriodSummary = {
  from: string;
  orderCount: number;
  paidOrderCount: number;
  paymentTotal: number;
  topProducts: ProductRank[];
};

type StatsResponse = {
  live: Record<string, number>;
  summary: {
    day: PeriodSummary;
    week: PeriodSummary;
    month: PeriodSummary;
  };
};

const LIVE_CARDS = [
  ["Bekleyen sipariş", "pending"],
  ["Hazırlanan", "preparing"],
  ["Servise hazır", "ready"],
  ["Garson çağrıları", "waiterCalls"],
  ["Hesap talepleri", "billRequests"],
  ["Bugünkü rezervasyon", "todayReservations"],
] as const;

const PERIODS = [
  { key: "day", label: "Günlük" },
  { key: "week", label: "Haftalık" },
  { key: "month", label: "Aylık" },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("day");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
    const timer = setInterval(() => {
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then(setStats);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const summary = stats?.summary[period];

  return (
    <div>
      <AdminPageHeader title="Özet" subtitle="Satış, sipariş ve ürün sıralaması" />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LIVE_CARDS.map(([label, key]) => (
          <AdminCard key={key}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold">{label}</p>
            <p className="mt-2 font-serif text-3xl">{stats ? stats.live[key] : "—"}</p>
          </AdminCard>
        ))}
      </div>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {PERIODS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPeriod(item.key)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm",
              period === item.key
                ? "border-gold bg-gold text-primary-foreground"
                : "border-gold/25 text-cream",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AdminCard>
          <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Toplam sipariş</p>
          <p className="mt-2 font-serif text-4xl">{summary ? summary.orderCount : "—"}</p>
          <p className="mt-1 text-xs text-muted">İptaller hariç</p>
        </AdminCard>
        <AdminCard>
          <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Toplam ödeme</p>
          <p className="mt-2 font-serif text-4xl text-gold">
            {summary ? formatTL(summary.paymentTotal) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {summary ? `${summary.paidOrderCount} ödemesi tamamlanan sipariş` : "Ödemesi tamamlananlar"}
          </p>
        </AdminCard>
      </div>

      <AdminCard>
        <p className="text-[10px] uppercase tracking-[0.16em] text-gold">En çok sipariş edilen ürünler</p>
        <p className="mt-1 text-xs text-muted">Adetten azalana doğru</p>

        {!summary ? (
          <p className="mt-6 text-sm text-muted">Yükleniyor...</p>
        ) : summary.topProducts.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Bu dönemde sipariş yok.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gold/10">
            {summary.topProducts.map((product, index) => (
              <li key={product.productId} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-cream">
                    <span className="mr-2 text-gold">{index + 1}.</span>
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Ciro: {formatTL(product.revenue)}</p>
                </div>
                <p className="shrink-0 font-serif text-2xl text-gold">{product.quantity}</p>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
