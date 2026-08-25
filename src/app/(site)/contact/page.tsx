"use client";

import { useState } from "react";
import { SITE, directionsUrl, mapsEmbedUrl } from "@/lib/site";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email"),
        message: form.get("message"),
        website: form.get("website"),
      }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Message sent. The restaurant will see it in the dashboard." : data.error ?? "Could not send.");
    setBusy(false);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-6">
      <div>
        <h1 className="font-display text-5xl text-brick">Contact</h1>
        <p className="mt-4 text-muted">{SITE.address.formatted}</p>
        <p className="mt-2"><a href={SITE.phoneHref} className="text-brick">{SITE.phone}</a></p>
        <p className="mt-2 text-sm text-muted">Hours listed publicly: 11:00 AM – 12:30 AM daily.</p>
        <a href={directionsUrl()} className="mt-4 inline-block text-sm text-brick underline">Get directions</a>
        <iframe title="Map" src={mapsEmbedUrl()} className="mt-6 h-64 w-full rounded-3xl border-0" loading="lazy" />
      </div>
      <form onSubmit={submit} className="grid gap-3 rounded-[2rem] bg-white p-6">
        <input name="name" required placeholder="Name" className="rounded-2xl border border-brick/15 p-3" />
        <input name="phone" placeholder="Phone" className="rounded-2xl border border-brick/15 p-3" />
        <input name="email" type="email" placeholder="Email" className="rounded-2xl border border-brick/15 p-3" />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <textarea name="message" required minLength={10} placeholder="Message" rows={5} className="rounded-2xl border border-brick/15 p-3" />
        <button disabled={busy} className="rounded-full bg-brick py-3 text-cream">{busy ? "Sending…" : "Send"}</button>
        {status && <p className="text-sm text-muted">{status}</p>}
      </form>
    </div>
  );
}
