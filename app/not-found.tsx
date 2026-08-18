import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">404</p>
      <h1 className="mt-3 font-serif text-4xl">Sayfa bulunamadı</h1>
      <p className="mt-3 text-sm text-muted">Aradığınız lezzet menüde olabilir.</p>
      <Link href="/menu" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-gold px-6 text-sm font-semibold text-primary-foreground">
        Menüye dön
      </Link>
    </div>
  );
}
