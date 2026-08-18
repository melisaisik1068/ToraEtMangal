import { CartDrawer } from "@/components/cart/cart-drawer";
import { StickyCartBar } from "@/components/cart/sticky-cart";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background-deep">
      <main>{children}</main>
      <MobileNav />
      <CartDrawer />
      <StickyCartBar />
    </div>
  );
}
