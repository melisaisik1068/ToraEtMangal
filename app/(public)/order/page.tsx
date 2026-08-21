import { CheckoutForm } from "@/components/order/checkout-form";
import { MenuHeader } from "@/components/layout/menu-header";

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-36 pt-4">
      <MenuHeader backHref="/menu" />
      <p className="text-xs uppercase tracking-[0.28em] text-gold">SİPARİŞ</p>
      <h1 className="mt-2 font-serif text-4xl">Siparişi tamamla</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
