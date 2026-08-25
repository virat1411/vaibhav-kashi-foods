import { SITE, directionsUrl } from "@/lib/site";
import { ASSETS } from "@/lib/assets";
import Link from "next/link";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-saffron">Varanasi</p>
      <h1 className="font-display mt-2 text-5xl text-brick">A vegetarian kitchen on Lathiya Bypass</h1>
      <img src={ASSETS.gallery.interior} alt="Restaurant dining room" className="mt-8 h-80 w-full rounded-[2rem] object-cover" />
      <div className="mt-8 space-y-4 text-lg text-muted">
        <p>
          Vaibhav Kashi Foods is a pure vegetarian restaurant in Bhikharipur Kala, Varanasi — opposite SHEPA College on the Lathiya Bypass. The kitchen cooks North Indian food, Indo-Chinese plates, tandoor, thalis, breads, rice and drinks.
        </p>
        <p>
          Public listings for Vaibhav Kashi Foods LLP describe outlets near NH2 (opposite SHEPA College) and at Assi Ghat. This website is the direct ordering channel for the SHEPA College / Lathiya Bypass kitchen at {SITE.address.formatted}.
        </p>
        <p>
          We do not invent founding stories, awards or chef biographies here. What we know from public sources: it is a vegetarian restaurant, the phone number is {SITE.phone}, and the menu you see is the live kitchen list — prices are filled in by the restaurant so they stay accurate.
        </p>
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/menu" className="rounded-full bg-brick px-5 py-2 text-cream">Order now</Link>
        <a href={directionsUrl()} className="rounded-full border px-5 py-2">Get directions</a>
      </div>
    </div>
  );
}
