"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";

type TableRow = {
  id: string;
  number: number;
  isActive: boolean;
  qrUrl: string;
  qrImage: string;
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableRow[]>([]);

  function load() {
    fetch("/api/admin/tables")
      .then((res) => res.json())
      .then((data) => setTables(data.tables ?? []));
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/tables")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setTables(data.tables ?? []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Masalar"
        subtitle={`${tables.length} masa · her masanın özel QR menüsü`}
        action={
          <>
            <Link href="/admin/qr" className="inline-flex min-h-11 items-center rounded-full border border-gold/40 px-4 text-sm">
              QR listesi
            </Link>
            <Link href="/admin/qr/print-all" className="inline-flex min-h-11 items-center rounded-full border border-gold/40 px-4 text-sm">
              Toplu yazdır
            </Link>
          </>
        }
      />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tables.map((table) => (
          <AdminCard key={table.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-serif text-2xl">Masa {table.number}</p>
              <span className={`text-xs ${table.isActive ? "text-gold" : "text-muted"}`}>
                {table.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={table.qrImage} alt={`Masa ${table.number} QR`} className="mx-auto mt-3 h-32 w-32" />
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Link className="min-h-11 rounded-xl border border-gold/20 px-3 py-2 text-center text-gold" href={`/admin/tables/${table.number}/print`}>
                Yazdır
              </Link>
              <a className="min-h-11 rounded-xl border border-gold/20 px-3 py-2 text-center" href={table.qrImage} download={`tora-et-masa-${table.number}.png`}>
                İndir
              </a>
              <button
                type="button"
                className="min-h-11 rounded-xl border border-gold/20 px-3 py-2 text-center"
                onClick={async () => {
                  await navigator.clipboard.writeText(table.qrUrl);
                  toast.success(`Masa ${table.number} linki kopyalandı.`);
                }}
              >
                Link
              </button>
              <button
                type="button"
                className="min-h-11 rounded-xl border border-gold/20 px-3 py-2 text-center text-muted"
                onClick={async () => {
                  await fetch("/api/admin/tables", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: table.id, isActive: !table.isActive }),
                  });
                  load();
                }}
              >
                {table.isActive ? "Pasif" : "Aktif"}
              </button>
            </div>
          </AdminCard>
        ))}
      </ul>
    </div>
  );
}
