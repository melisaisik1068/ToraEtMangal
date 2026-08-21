"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useLivePoll } from "@/lib/realtime/use-live-poll";
import { cn } from "@/lib/utils";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  note?: string | null;
  status: string;
  createdAt?: string;
};

type PurgeSummary = {
  days: number;
  from: string;
  deletableCount: number;
  completedCount: number;
  cancelledCount: number;
  activeCount: number;
};

const PURGE_PERIODS = [
  { days: 7, label: "Son 1 hafta" },
  { days: 30, label: "Son 30 gün" },
  { days: 60, label: "Son 60 gün" },
] as const;

export default function ReservationsPage() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [purgeDays, setPurgeDays] = useState<(typeof PURGE_PERIODS)[number]["days"]>(7);
  const [purgeSummary, setPurgeSummary] = useState<PurgeSummary | null>(null);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/reservations");
    const data = await res.json();
    setRows(data.reservations ?? []);
  }, []);

  useLivePoll(load);

  const loadPurge = useCallback(async (days: number) => {
    setPurgeLoading(true);
    const res = await fetch(`/api/admin/reservations/purge?days=${days}`);
    const data = await res.json().catch(() => ({}));
    setPurgeLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Özet alınamadı.");
      return;
    }
    setPurgeSummary(data.summary as PurgeSummary);
  }, []);

  useEffect(() => {
    void loadPurge(7);
  }, [loadPurge]);

  async function selectPurgePeriod(days: (typeof PURGE_PERIODS)[number]["days"]) {
    setPurgeDays(days);
    await loadPurge(days);
  }

  async function purge() {
    setDeleting(true);
    const res = await fetch("/api/admin/reservations/purge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: purgeDays }),
    });
    const data = await res.json().catch(() => ({}));
    setDeleting(false);
    setConfirmOpen(false);

    if (!res.ok) {
      toast.error(data.error ?? "Silme başarısız.");
      return;
    }

    toast.success(`${data.deleted ?? 0} rezervasyon silindi.`);
    await Promise.all([load(), loadPurge(purgeDays)]);
  }

  const pending = rows.filter((row) => row.status === "PENDING");
  const others = rows.filter((row) => row.status !== "PENDING");
  const periodLabel = PURGE_PERIODS.find((p) => p.days === purgeDays)?.label ?? `${purgeDays} gün`;

  return (
    <div>
      <AdminPageHeader
        title="Rezervasyonlar"
        subtitle={`${pending.length} bekleyen · ${rows.length} toplam`}
      />

      {pending.length > 0 ? (
        <div className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-gold">Bekleyen talepler</p>
          {pending.map((row) => (
            <AdminCard key={row.id} className="border-gold bg-gold/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-sm text-muted">{row.phone}</p>
                  {row.email ? <p className="text-xs text-muted">{row.email}</p> : null}
                </div>
                <p className="text-sm text-gold">{row.guests} kişi</p>
              </div>
              <p className="mt-2 text-sm">
                {new Date(row.date).toLocaleDateString("tr-TR")} · {row.time}
              </p>
              {row.note ? <p className="mt-1 text-sm text-muted">Not: {row.note}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-primary-foreground"
                  onClick={async () => {
                    await fetch("/api/admin/reservations", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: row.id, status: "CONFIRMED" }),
                    });
                    load();
                  }}
                >
                  Onayla
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-gold/30 px-4 text-sm text-muted"
                  onClick={async () => {
                    await fetch("/api/admin/reservations", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: row.id, status: "CANCELLED" }),
                    });
                    load();
                  }}
                >
                  Reddet
                </button>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : (
        <p className="mb-8 rounded-3xl border border-gold/15 p-6 text-center text-sm text-muted">
          Bekleyen rezervasyon yok.
        </p>
      )}

      <div className="mb-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Diğer kayıtlar</p>
        {others.map((row) => (
          <AdminCard key={row.id} className={cn(row.status === "CONFIRMED" && "border-gold/30")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-sm text-muted">{row.phone}</p>
              </div>
              <p className="text-sm text-gold">{row.guests} kişi</p>
            </div>
            <p className="mt-2 text-sm">
              {new Date(row.date).toLocaleDateString("tr-TR")} · {row.time}
            </p>
            <select
              className="mt-4 min-h-11 w-full rounded-xl border border-gold/20 bg-background-deep px-3 text-sm"
              value={row.status}
              onChange={async (event) => {
                await fetch("/api/admin/reservations", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: row.id, status: event.target.value }),
                });
                load();
              }}
            >
              <option value="PENDING">Bekliyor</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="SEATED">Oturdu</option>
              <option value="CANCELLED">İptal</option>
              <option value="COMPLETED">Tamamlandı</option>
            </select>
          </AdminCard>
        ))}
      </div>

      <section className="space-y-3 border-t border-gold/15 pt-8">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">Geçmişi sil</p>
        <p className="text-sm text-muted">
          Sadece tamamlanan ve iptal rezervasyonlar silinir; bekleyen / onaylı kayıtlar korunur.
        </p>

        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {PURGE_PERIODS.map((item) => (
            <button
              key={item.days}
              type="button"
              onClick={() => selectPurgePeriod(item.days)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-sm",
                purgeDays === item.days
                  ? "border-gold bg-gold text-primary-foreground"
                  : "border-gold/25 text-cream",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {purgeLoading && !purgeSummary ? (
          <div className="h-28 animate-pulse rounded-3xl bg-white/5" />
        ) : null}

        {purgeSummary ? (
          <AdminCard>
            <p className="text-sm text-muted">
              {new Date(purgeSummary.from).toLocaleDateString("tr-TR")} – bugün · {periodLabel}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-gold/15 p-3">
                <dt className="text-xs text-muted">Silinecek</dt>
                <dd className="mt-1 font-serif text-2xl">{purgeSummary.deletableCount}</dd>
              </div>
              <div className="rounded-2xl border border-gold/15 p-3">
                <dt className="text-xs text-muted">Tamamlanan / İptal</dt>
                <dd className="mt-1 text-lg">
                  {purgeSummary.completedCount} / {purgeSummary.cancelledCount}
                </dd>
              </div>
            </dl>
            {purgeSummary.activeCount > 0 ? (
              <p className="mt-3 text-sm text-amber-200">
                Bu dönemde {purgeSummary.activeCount} aktif rezervasyon korunacak.
              </p>
            ) : null}
            <Button
              className="mt-4 w-full bg-destructive text-white hover:bg-destructive/90"
              disabled={purgeSummary.deletableCount === 0}
              onClick={() => setConfirmOpen(true)}
            >
              {purgeSummary.deletableCount === 0
                ? "Silinecek kayıt yok"
                : `${periodLabel} rezervasyonlarını sil (${purgeSummary.deletableCount})`}
            </Button>
          </AdminCard>
        ) : null}
      </section>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`${periodLabel} silinsin mi?`}
      >
        <p className="text-sm text-muted">
          {purgeSummary?.deletableCount ?? 0} tamamlanan / iptal rezervasyon kalıcı olarak
          silinecek.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
            Vazgeç
          </Button>
          <Button
            className="flex-1 bg-destructive text-white hover:bg-destructive/90"
            loading={deleting}
            onClick={purge}
          >
            Evet, sil
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
