export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="h-10 w-64 animate-pulse rounded-full bg-brick/10" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-3xl bg-brick/5" />
        ))}
      </div>
    </div>
  );
}
