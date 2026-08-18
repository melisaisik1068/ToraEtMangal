import { ReservationForm } from "@/components/reservation/reservation-form";

export const metadata = { title: "Rezervasyon" };

export default function ReservationPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">REZERVASYON</p>
      <h1 className="mt-2 font-serif text-4xl">Sofranızı ayırtın</h1>
      <p className="mt-3 text-sm text-muted">
        Talebiniz ekibimize ulaşır; uygunluk onayını telefon veya e-posta ile iletiriz.
      </p>
      <div className="mt-8">
        <ReservationForm />
      </div>
    </div>
  );
}
