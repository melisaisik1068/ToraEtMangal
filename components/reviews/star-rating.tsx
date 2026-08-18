"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StarRating({ onSubmit }: { onSubmit: (rating: number) => Promise<void> }) {
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);

  return (
    <section className="mt-8 rounded-3xl border border-gold/20 p-5 text-center">
      <h2 className="text-xs uppercase tracking-[0.2em] text-gold">BİZİ DEĞERLENDİRİN</h2>
      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} yıldız`}
            className="h-11 w-11"
            onClick={() => setRating(value)}
          >
            <Star className={value <= rating ? "fill-gold text-gold" : "text-gold/40"} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      {sent ? (
        <p className="mt-4 text-sm text-muted">Teşekkürler.</p>
      ) : (
        <Button
          className="mt-4"
          disabled={!rating}
          onClick={async () => {
            await onSubmit(rating);
            setSent(true);
          }}
        >
          Gönder
        </Button>
      )}
    </section>
  );
}
