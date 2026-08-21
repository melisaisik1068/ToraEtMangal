"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type QrTable = {
  id: string;
  number: number;
  isActive: boolean;
  qrUrl: string;
  qrImage: string;
};

export function QrTablesManager({ initialTables }: { initialTables: QrTable[] }) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<QrTable | null>(null);

  const suggested = (tables.reduce((max, t) => Math.max(max, t.number), 0) || 0) + 1;

  async function addTable() {
    setLoading(true);
    const payload = number.trim() === "" ? {} : { number: Number(number) };

    const res = await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Masa eklenemedi.");
      return;
    }

    setTables((prev) =>
      [...prev, data.table as QrTable].sort((a, b) => a.number - b.number),
    );
    setOpen(false);
    setNumber("");
    toast.success(`Masa ${data.table.number} ve QR kodu eklendi.`);
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    const res = await fetch("/api/admin/tables", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pendingDelete.id }),
    });
    const data = await res.json().catch(() => ({}));
    setDeletingId(null);

    if (!res.ok) {
      toast.error(data.error ?? "Masa silinemedi.");
      return;
    }

    setTables((prev) => prev.filter((t) => t.id !== pendingDelete.id));
    toast.success(`Masa ${pendingDelete.number} silindi.`);
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div>
      <AdminPageHeader
        title="QR Kodları"
        subtitle={`${tables.length} masa QR menüsü`}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setNumber(String(suggested));
                setOpen(true);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/40 px-4 text-sm text-gold"
            >
              <Plus className="h-4 w-4" />
              Masa ekle
            </button>
            <Link
              href="/admin/qr/print-all"
              className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-primary-foreground"
            >
              Toplu yazdır
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tables.map((table) => (
          <article
            key={table.id}
            className="rounded-3xl border border-gold/15 bg-background p-4 text-center"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="w-10" />
              <p className="font-serif text-2xl">Masa {table.number}</p>
              <button
                type="button"
                aria-label={`Masa ${table.number} sil`}
                disabled={deletingId === table.id}
                onClick={() => setPendingDelete(table)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-destructive/40 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={table.qrImage}
              alt={`Masa ${table.number} QR kodu`}
              className="mx-auto mt-3 h-36 w-36"
            />
            <p className="mt-2 truncate text-[10px] text-muted">{table.qrUrl}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Link
                href={`/admin/tables/${table.number}/print`}
                className="min-h-11 rounded-xl border border-gold/20 px-3 py-2 text-gold"
              >
                Yazdır
              </Link>
              <a
                href={table.qrImage}
                download={`tora-et-masa-${table.number}.png`}
                className="min-h-11 rounded-xl border border-gold/20 px-3 py-2"
              >
                İndir
              </a>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={() => {
            setNumber(String(suggested));
            setOpen(true);
          }}
          className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-gold/35 bg-gold/5 p-4 text-gold"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40">
            <Plus className="h-7 w-7" />
          </span>
          <span className="font-serif text-xl">Yeni masa + QR</span>
          <span className="text-xs text-muted">Önerilen: Masa {suggested}</span>
        </button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Masa ve QR ekle">
        <p className="text-sm text-muted">
          Masa numarası boş bırakılırsa sıradaki numara ({suggested}) kullanılır.
        </p>
        <Input
          className="mt-4"
          type="number"
          min={1}
          max={999}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder={`Örn: ${suggested}`}
        />
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button className="flex-1" loading={loading} onClick={addTable}>
            Ekle
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title={pendingDelete ? `Masa ${pendingDelete.number} silinsin mi?` : "Masa sil"}
      >
        <p className="text-sm text-muted">
          QR kodu ve masa kaydı kalıcı olarak silinir. Açık sipariş varken silinemez.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setPendingDelete(null)}>
            Vazgeç
          </Button>
          <Button
            className="flex-1 bg-destructive text-white hover:bg-destructive/90"
            loading={Boolean(deletingId)}
            onClick={confirmDelete}
          >
            Sil
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
