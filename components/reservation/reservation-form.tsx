"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { reservationSchema, type ReservationInput } from "@/lib/validations";

export function ReservationForm() {
  const form = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { name: "", phone: "", email: "", date: "", time: "", guests: 2, note: "" },
  });

  async function onSubmit(values: ReservationInput) {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Rezervasyon gönderilemedi.");
      return;
    }
    toast.success("Rezervasyon talebiniz alındı.");
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Ad Soyad</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" {...form.register("phone")} />
        {form.formState.errors.phone ? (
          <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date">Tarih</Label>
          <Input id="date" type="date" {...form.register("date")} />
        </div>
        <div>
          <Label htmlFor="time">Saat</Label>
          <Input id="time" type="time" {...form.register("time")} />
        </div>
      </div>
      <div>
        <Label htmlFor="guests">Kişi sayısı</Label>
        <Input id="guests" type="number" min={1} max={20} {...form.register("guests", { valueAsNumber: true })} />
      </div>
      <div>
        <Label htmlFor="note">Not</Label>
        <Textarea id="note" {...form.register("note")} />
      </div>
      <Button className="w-full" loading={form.formState.isSubmitting} type="submit">
        REZERVASYON TALEBİ GÖNDER
      </Button>
    </form>
  );
}
