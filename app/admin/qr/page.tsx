import { generateTableQrDataUrl } from "@/lib/qr";
import { ensureRestaurantTables } from "@/lib/services/tables";
import { siteUrl } from "@/lib/utils";
import { QrTablesManager } from "@/components/admin/qr-tables-manager";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  const tables = await ensureRestaurantTables();
  const cards = await Promise.all(
    tables.map(async (table) => ({
      id: table.id,
      number: table.number,
      isActive: table.isActive,
      qrUrl: siteUrl(`/qr/${table.number}`),
      qrImage: await generateTableQrDataUrl(table.number),
    })),
  );

  return <QrTablesManager initialTables={cards} />;
}
