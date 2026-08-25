"use client";

import { whatsappOrderUrl } from "@/lib/whatsapp";

export function WhatsAppOrder(props: {
  phone: string;
  restaurant: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  address: string;
  total: string;
}) {
  return (
    <a
      href={whatsappOrderUrl(props)}
      className="mt-6 inline-block rounded-full border border-leaf px-5 py-2 text-sm text-leaf"
      target="_blank"
      rel="noreferrer"
    >
      Order on WhatsApp
    </a>
  );
}
