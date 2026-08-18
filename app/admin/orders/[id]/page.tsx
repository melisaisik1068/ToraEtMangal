"use client";

import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatTL } from "@/lib/money";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<{
    orderNumber: string;
    status: string;
    total: string;
    note: string | null;
    table?: { number: number };
    items: { id: string; quantity: number; unitPrice: string; product: { name: string } }[];
  } | null>(null);

  useEffect(() => {
    params.then(async ({ id }) => {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      setOrder(data.order);
    });
  }, [params]);

  if (!order) {
    return (
      <div>
        <AdminPageHeader title="Sipariş" subtitle="Yükleniyor..." />
        <AdminCard>
          <p className="text-sm text-muted">Sipariş bilgileri getiriliyor.</p>
        </AdminCard>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={`#${order.orderNumber}`}
        subtitle={`Masa ${order.table?.number ?? "-"} · ${ORDER_STATUS_LABELS[order.status] ?? order.status}`}
      />
      <AdminCard>
        <h2 className="text-xs uppercase tracking-[0.16em] text-gold">Ürünler</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span className="text-gold">{formatTL(item.unitPrice)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-gold/15 pt-4 font-semibold">
          Toplam <span className="text-gold">{formatTL(order.total)}</span>
        </p>
        {order.note ? <p className="mt-4 text-sm text-muted">Not: {order.note}</p> : null}
      </AdminCard>
    </div>
  );
}
