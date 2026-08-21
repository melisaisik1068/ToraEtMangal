"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  QR_SESSION_KEY,
  isTableSessionValid,
  useCartStore,
} from "@/store/cart";

/**
 * Masa yalnızca /qr/[n] ile bağlanır.
 * Normal linkle girişte (QR oturumu yok) veya süresi dolmuşsa masa temizlenir.
 */
export function TableSessionGuard() {
  const pathname = usePathname();
  const tableNumber = useCartStore((s) => s.tableNumber);
  const tableBoundAt = useCartStore((s) => s.tableBoundAt);
  const clearTable = useCartStore((s) => s.clearTable);
  const setTable = useCartStore((s) => s.setTable);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const onQrPage = pathname.startsWith("/qr/");
    if (onQrPage) {
      try {
        sessionStorage.setItem(QR_SESSION_KEY, "1");
      } catch {
        // ignore
      }
      return;
    }

    let hasQrSession = false;
    try {
      hasQrSession = sessionStorage.getItem(QR_SESSION_KEY) === "1";
    } catch {
      hasQrSession = false;
    }

    if (!hasQrSession) {
      if (tableNumber != null) clearTable();
      return;
    }

    if (!isTableSessionValid(tableNumber, tableBoundAt)) {
      try {
        sessionStorage.removeItem(QR_SESSION_KEY);
      } catch {
        // ignore
      }
      clearTable();
      return;
    }

    // Eski kayıtlarda tableBoundAt yoksa mevcut masayı geçersiz say
    if (tableNumber != null && tableBoundAt == null) {
      clearTable();
    }
  }, [pathname, tableNumber, tableBoundAt, clearTable, setTable]);

  return null;
}
