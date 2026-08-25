const STEPS = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

const LABELS: Record<string, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return <p className="mt-6 rounded-2xl bg-brick/10 p-4 text-sm text-brick">This order was cancelled.</p>;
  }
  const current = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <ol className="mt-8 grid gap-3">
      {STEPS.map((step, i) => (
        <li key={step} className="flex items-center gap-3 text-sm">
          <span
            className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
              i < current ? "bg-leaf text-white" : i === current ? "bg-brick text-cream" : "border border-brick/20"
            }`}
          >
            {i < current ? "✓" : i === current ? "●" : "○"}
          </span>
          {LABELS[step]}
        </li>
      ))}
    </ol>
  );
}
