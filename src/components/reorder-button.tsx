"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch(`/api/orders/${orderId}`, { method: "POST" });
        if (res.ok) router.push("/cart");
        setBusy(false);
      }}
      className="rounded-full bg-brick px-4 py-1.5 text-sm text-cream"
    >
      {busy ? "Adding…" : "Reorder"}
    </button>
  );
}
