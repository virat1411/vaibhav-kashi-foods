import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { SITE, directionsUrl } from "@/lib/site";
import { ASSETS } from "@/lib/assets";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brick/10 bg-brick-deep text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <img src={ASSETS.logo} alt="" className="mb-4 h-14 w-14 rounded-full" />
          <p className="font-display text-2xl">Vaibhav Kashi Foods</p>
          <p className="mt-2 max-w-xs text-sm text-cream/75">
            Pure vegetarian North Indian and Chinese food from Lathiya Bypass, Varanasi. Order direct — no marketplace markup.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Visit</p>
          <p className="mt-3 flex gap-2 text-sm text-cream/85">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {SITE.address.formatted}
          </p>
          <a href={SITE.phoneHref} className="mt-3 flex items-center gap-2 text-sm hover:text-gold">
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          <a href={directionsUrl()} className="mt-3 inline-block text-sm text-gold underline-offset-4 hover:underline">
            Get directions
          </a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Menu</p>
          <ul className="mt-3 space-y-2 text-sm text-cream/85">
            <li><Link href="/menu/thali" className="hover:text-gold">Thali</Link></li>
            <li><Link href="/menu/starters" className="hover:text-gold">Starters</Link></li>
            <li><Link href="/menu/main-course" className="hover:text-gold">Main course</Link></li>
            <li><Link href="/menu/breads" className="hover:text-gold">Breads</Link></li>
            <li><Link href="/menu/biryani" className="hover:text-gold">Biryani</Link></li>
            <li><Link href="/menu/beverages" className="hover:text-gold">Drinks</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Kitchen hours</p>
          <p className="mt-3 text-sm text-cream/85">Open daily, 11:00 AM – 12:30 AM</p>
          <p className="mt-1 text-xs text-cream/55">Hours from public listings — confirm in admin if this changes.</p>
          <a href={SITE.instagram} className="mt-4 inline-flex items-center gap-2 text-sm hover:text-gold">
            <Instagram className="h-4 w-4" /> @vaibhavkashifoods
          </a>
        </div>
      </div>
      <div className="border-t border-cream/10 px-4 py-5 text-center text-xs text-cream/60 md:flex md:justify-between md:px-10">
        <p>© {new Date().getFullYear()} {SITE.legalName}</p>
        <p className="mt-2 flex flex-wrap justify-center gap-4 md:mt-0">
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-and-conditions">Terms</Link>
          <Link href="/refund-policy">Refunds</Link>
          <Link href="/shipping-and-delivery">Delivery</Link>
        </p>
      </div>
    </footer>
  );
}
