import { notFound } from "next/navigation";
import { QrWelcome } from "@/components/qr/qr-welcome";
import { EmptyState } from "@/components/ui/states";
import { getTableByNumber } from "@/lib/services/catalog";
import { parseTableParam } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TableQrPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  const number = parseTableParam(tableId);
  if (!number) notFound();
  const table = await getTableByNumber(number);
  if (!table || !table.isActive) {
    return (
      <div className="px-4 py-20">
        <EmptyState
          title="QR geçersiz"
          description="Masa bulunamadı veya şu anda aktif değil. Lütfen personelden yardım isteyin."
        />
      </div>
    );
  }

  return <QrWelcome tableNumber={table.number} />;
}
