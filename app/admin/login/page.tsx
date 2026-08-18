"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        className="w-full max-w-md rounded-[2rem] border border-gold/20 bg-background p-8"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          setLoading(false);
          if (!res.ok) {
            setError(data.error ?? "Giriş başarısız.");
            return;
          }
          router.push("/admin");
        }}
      >
        <div className="flex justify-center">
          <BrandLogo href="/" size={110} />
        </div>
        <h1 className="mt-6 text-center font-serif text-3xl">Erişiminizi Sağlayın</h1>
        <div className="mt-8">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mt-4">
          <Label htmlFor="password">Şifre</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <Button className="mt-6 w-full" loading={loading} type="submit">
          Giriş Yap
        </Button>
      </form>
    </div>
  );
}
