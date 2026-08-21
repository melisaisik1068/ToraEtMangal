export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <div className="h-10 w-48 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-40 animate-pulse rounded-[2rem] bg-white/5" />
      <div className="h-40 animate-pulse rounded-[2rem] bg-white/5" />
      <p className="text-sm text-muted">Yükleniyor…</p>
    </div>
  );
}
