"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatTL } from "@/lib/money";
import { cn } from "@/lib/utils";

type ProductOption = { id: string; name: string; price: string; isAvailable: boolean };
type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string;
  note: string | null;
  status: string;
  product: { id: string; name: string };
};
type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  note: string | null;
  table?: { number: number } | null;
  items: OrderItem[];
};

const ORDER_ACTIONS = [
  { key: "COMPLETED", label: "Ödemesi Tamamlandı" },
  { key: "CANCELLED", label: "Sipariş İptal" },
] as const;

const ITEM_STATUS_ACTIONS = [
  { key: "PENDING", label: "Alındı" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "READY", label: "Hazır" },
  { key: "SERVED", label: "Servis" },
  { key: "CANCELLED", label: "İptal" },
] as const;

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const locked = order?.status === "COMPLETED" || order?.status === "CANCELLED";

  const availableProducts = useMemo(
    () => products.filter((p) => p.isAvailable),
    [products],
  );

  async function load(id: string) {
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    if (data.order) {
      setOrder(data.order);
      setNote(data.order.note ?? "");
    }
  }

  useEffect(() => {
    params.then(async ({ id }) => {
      setOrderId(id);
      await load(id);
      const productsRes = await fetch("/api/admin/products");
      const productsData = await productsRes.json();
      setProducts(productsData.products ?? []);
    });
  }, [params]);

  async function patch(body: Record<string, unknown>) {
    if (!orderId) return;
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      toast.error(data.error ?? "İşlem başarısız.");
      return;
    }
    setOrder(data.order);
    setNote(data.order.note ?? "");
    toast.success("Sipariş güncellendi.");
  }

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
    <div className="space-y-4">
      <AdminPageHeader
        title={`#${order.orderNumber}`}
        subtitle={`Masa ${order.table?.number ?? "-"} · ${ORDER_STATUS_LABELS[order.status] ?? order.status}`}
        action={
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center text-sm text-gold">
            Listeye dön
          </Link>
        }
      />

      <AdminCard>
        <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-gold">Sipariş (ödeme / iptal)</p>
        <div className="flex flex-wrap gap-2">
          {ORDER_ACTIONS.map((status) => (
            <button
              key={status.key}
              type="button"
              disabled={saving}
              onClick={() => patch({ op: "status", status: status.key })}
              className={cn(
                "min-h-10 rounded-full border px-3 text-xs",
                order.status === status.key
                  ? status.key === "CANCELLED"
                    ? "border-destructive bg-destructive/20 font-semibold text-destructive"
                    : "border-gold bg-gold font-semibold text-primary-foreground"
                  : status.key === "CANCELLED"
                    ? "border-destructive/40 text-destructive"
                    : "border-gold/30 text-cream",
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <h2 className="text-xs uppercase tracking-[0.16em] text-gold">Ürünler (tek tek durum)</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-gold/15 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gold">{formatTL(item.unitPrice)} / adet</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-gold">
                    {ORDER_STATUS_LABELS[item.status] ?? item.status}
                  </p>
                </div>
                <p className="text-sm text-gold">
                  {formatTL(Number(item.unitPrice) * item.quantity)}
                </p>
              </div>
              {!locked ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ITEM_STATUS_ACTIONS.map((status) => (
                      <button
                        key={status.key}
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          patch({ op: "itemStatus", itemId: item.id, status: status.key })
                        }
                        className={cn(
                          "min-h-9 rounded-full border px-2.5 text-[11px]",
                          item.status === status.key ||
                            (status.key === "PREPARING" && item.status === "CONFIRMED")
                            ? status.key === "CANCELLED"
                              ? "border-destructive bg-destructive/20 font-semibold text-destructive"
                              : "border-gold bg-gold font-semibold text-primary-foreground"
                            : status.key === "CANCELLED"
                              ? "border-destructive/40 text-destructive"
                              : "border-gold/30 text-cream",
                        )}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30"
                      onClick={() =>
                        patch({ op: "setItemQty", itemId: item.id, quantity: item.quantity - 1 })
                      }
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30"
                      onClick={() =>
                        patch({ op: "setItemQty", itemId: item.id, quantity: item.quantity + 1 })
                      }
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-sm text-destructive"
                      onClick={() => patch({ op: "removeItem", itemId: item.id })}
                    >
                      Çıkar
                    </button>
                  </div>
                </>
              ) : null}
            </li>
          ))}
          {order.items.length === 0 ? (
            <p className="text-sm text-muted">Siparişte ürün yok.</p>
          ) : null}
        </ul>
        <p className="mt-4 flex justify-between border-t border-gold/15 pt-4 font-semibold">
          Toplam <span className="text-gold">{formatTL(order.total)}</span>
        </p>
      </AdminCard>

      {!locked ? (
        <AdminCard>
          <h2 className="text-xs uppercase tracking-[0.16em] text-gold">Ürün ekle</h2>
          <div className="mt-4 space-y-3">
            <select
              className="min-h-11 w-full rounded-2xl border border-gold/20 bg-background-deep px-3 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Ürün seçin</option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {formatTL(product.price)}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min="1"
              max="50"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Adet"
            />
            <Button
              className="w-full"
              loading={saving}
              onClick={() => {
                if (!productId) {
                  toast.error("Ürün seçin.");
                  return;
                }
                patch({
                  op: "addItem",
                  productId,
                  quantity: Number(qty) || 1,
                });
              }}
            >
              Ürünü siparişe ekle
            </Button>
          </div>
        </AdminCard>
      ) : null}

      <AdminCard>
        <h2 className="text-xs uppercase tracking-[0.16em] text-gold">Sipariş notu</h2>
        <Textarea
          className="mt-3"
          value={note}
          disabled={locked || saving}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Not"
        />
        {!locked ? (
          <Button
            className="mt-3 w-full"
            variant="outline"
            loading={saving}
            onClick={() => patch({ op: "note", note: note.trim() || null })}
          >
            Notu kaydet
          </Button>
        ) : null}
      </AdminCard>
    </div>
  );
}
