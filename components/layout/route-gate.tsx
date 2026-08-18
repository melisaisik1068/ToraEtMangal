"use client";

import { usePathname } from "next/navigation";
import { isAppShellPath } from "@/lib/paths";

export function RouteGate({
  children,
  hideOnHome,
  hideOnAppShell,
}: {
  children: React.ReactNode;
  hideOnHome?: boolean;
  hideOnAppShell?: boolean;
}) {
  const pathname = usePathname();
  if (hideOnHome && pathname === "/") return null;
  if (hideOnAppShell && isAppShellPath(pathname)) return null;
  return <>{children}</>;
}
