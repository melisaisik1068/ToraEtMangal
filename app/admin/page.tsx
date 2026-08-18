"use client";

import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";

const CARDS = [
  ["Toplam sipariş", "totalOrders"],
  ["Bugünkü sipariş", "todayOrders"],
  ["Bekleyen sipariş", "pending"],
  ["Hazırlanan sipariş", "preparing"],
  ["Servise hazır", "ready"],
  ["Bugünkü rezervasyon", "todayReservations"],
  ["Aktif masa", "activeTables"],
  ["Garson çağrıları", "waiterCalls"],
  ["Hesap talepleri", "billRequests"],
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="Canlı operasyon özeti" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CARDS.map(([label, key]) => (
          <AdminCard key={key}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold">{label}</p>
            <p className="mt-2 font-serif text-3xl">{stats ? stats[key] : "—"}</p>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
