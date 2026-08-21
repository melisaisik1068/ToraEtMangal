import { CartDrawer } from "@/components/cart/cart-drawer";
import { StickyCartBar } from "@/components/cart/sticky-cart";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Navbar } from "@/components/layout/navbar";
import { RouteGate } from "@/components/layout/route-gate";
import { TableSessionBar } from "@/components/layout/table-session-bar";
import { TableSessionGuard } from "@/components/layout/table-session-guard";
import { JsonLd } from "@/components/seo/json-ld";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(47,107,82,0.18),transparent_50%)]"
      />
      <JsonLd />
      <TableSessionGuard />
      <Navbar />
      <TableSessionBar />
      <main className="flex-1">{children}</main>
      <RouteGate hideOnAppShell hideOnHome>
        <Footer />
      </RouteGate>
      <MobileNav />
      <CartDrawer />
      <StickyCartBar />
    </div>
  );
}
