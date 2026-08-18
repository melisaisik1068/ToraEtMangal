export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-gold/20 bg-card px-6 py-12 text-center">
      <h2 className="font-serif text-3xl text-cream">{title}</h2>
      {description ? <p className="mx-auto mt-3 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/5 ${className ?? "h-24"}`} />;
}
