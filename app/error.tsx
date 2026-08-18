"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Sunucu hatası</h1>
      <p className="mt-3 text-sm text-muted">Bir şeyler ters gitti. Lütfen tekrar deneyin.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-gold px-6 text-sm font-semibold text-primary-foreground"
      >
        Yeniden dene
      </button>
    </div>
  );
}
