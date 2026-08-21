"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatTL } from "@/lib/money";
import { cn } from "@/lib/utils";

type Summary = {
  days: number;
  from: string;
  deletableCount: number;
  completedCount: number;
  cancelledCount: number;
  activeCount: number;
  paymentTotal: number;
  paymentCount: number;
};

const PERIODS = [
  { days: 7, label: "Son 1 hafta" },
  { days: 30, label: "Son 30 gün" },
  { days: 60, label: "Son 60 gün" },
] as const;

export default function AdminHistoryPage() {
  const [days, setDays] = useState<(typeof PERIODS)[number]["days"]>(7);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (periodDays: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/purge?days=${periodDays}`);
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Özet alınamadı.");
      return;
    }
    setSummary(data.summary as Summary);
  }, []);

  useEffect(() => {
    void load(7);
  }, [load]);

  async function selectPeriod(periodDays: (typeof PERIODS)[number]["days"]) {
    setDays(periodDays);
    await load(periodDays);
  }

  async function purge() {
    setDeleting(true);
    const res = await fetch("/api/admin/orders/purge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    const data = await res.json().catch(() => ({}));
    setDeleting(false);
    setConfirmOpen(false);

    if (!res.ok) {
      toast.error(data.error ?? "Silme başarısız.");
      return;
    }

    toast.success(`${data.deleted ?? 0} sipariş silindi.`);
    await load(days);
  }

  const periodLabel = PERIODS.find((p) => p.days === days)?.label ?? `${days} gün`;

  return (
    <div>
      <AdminPageHeader
        title="Geçmiş sil"
        subtitle="Tamamlanan ödemeler ve iptal siparişleri dönem seçerek temizlenir"
      />

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {PERIODS.map((item) => (
          <button
            key={item.days}
            type="button"
            onClick={() => selectPeriod(item.days)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm",
              days === item.days && summary
                ? "border-gold bg-gold text-primary-foreground"
                : "border-gold/25 text-cream",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && !summary ? (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-3xl bg-white/5" />
          <div className="h-28 animate-pulse rounded-3xl bg-white/5" />
        </div>
      ) : null}

      {summary ? (
        <div className="space-y-3">
          <AdminCard>
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold">{periodLabel}</p>
            <p className="mt-2 text-sm text-muted">
              {new Date(summary.from).toLocaleDateString("tr-TR")} – bugün
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-gold/15 p-3">
                <dt className="text-xs text-muted">Silinecek kayıt</dt>
                <dd className="mt-1 font-serif text-2xl text-cream">{summary.deletableCount}</dd>
              </div>
              <div className="rounded-2xl border border-gold/15 p-3">
                <dt className="text-xs text-muted">Ödeme toplamı</dt>
                <dd className="mt-1 font-serif text-2xl text-gold">
                  {formatTL(summary.paymentTotal)}
                </dd>
              </div>
              <div className="rounded-2xl border border-gold/15 p-3">
                <dt className="text-xs text-muted">Tamamlanan ödeme</dt>
                <dd className="mt-1 text-lg text-cream">{summary.completedCount}</dd>
              </div>
              <div className="rounded-2xl border border-gold/15 p-3">
                <dt className="text-xs text-muted">İptal sipariş</dt>
                <dd className="mt-1 text-lg text-cream">{summary.cancelledCount}</dd>
              </div>
            </dl>
            {summary.activeCount > 0 ? (
              <p className="mt-4 text-sm text-amber-200">
                Bu dönemde {summary.activeCount} açık sipariş var — bunlar silinmez.
              </p>
            ) : null}
          </AdminCard>

          <AdminCard>
            <p className="text-sm text-muted">
              Bu işlem geri alınamaz. Seçilen dönemdeki tamamlanan ödemeler ve iptaller kalıcı
              olarak silinir.
            </p>
            <Button
              className="mt-4 w-full bg-destructive text-white hover:bg-destructive/90"
              disabled={summary.deletableCount === 0}
              onClick={() => setConfirmOpen(true)}
            >
              {summary.deletableCount === 0
                ? "Silinecek kayıt yok"
                : `${periodLabel} kayıtlarını sil (${summary.deletableCount})`}
            </Button>
          </AdminCard>
        </div>
      ) : null}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`${periodLabel} silinsin mi?`}
      >
        <p className="text-sm text-muted">
          {summary?.deletableCount ?? 0} sipariş / ödeme kaydı kalıcı olarak silinecek.
          {summary && summary.paymentTotal > 0
            ? ` Ödeme toplamı: ${formatTL(summary.paymentTotal)}.`
            : ""}
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
