import { notFound } from "next/navigation";
import { OrderTracker } from "@/components/order/order-tracker";
import { prisma } from "@/lib/db";
import type { OrderStatusValue } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, table: true },
  });
  if (!order) notFound();

  return (
    <OrderTracker
      initial={{
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status as OrderStatusValue,
        total: order.total.toString(),
        createdAt: order.createdAt.toISOString(),
        table: order.table,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          product: { name: item.product.name },
        })),
      }}
    />
  );
}
