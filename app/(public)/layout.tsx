import { CartDrawer } from "@/components/cart/cart-drawer";
import { StickyCartBar } from "@/components/cart/sticky-cart";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Navbar } from "@/components/layout/navbar";
import { RouteGate } from "@/components/layout/route-gate";
import { TableSessionBar } from "@/components/layout/table-session-bar";
import { JsonLd } from "@/components/seo/json-ld";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background-deep shadow-2xl lg:max-w-none">
      <JsonLd />
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
