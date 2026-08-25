import Link from "next/link";
import Image from "next/image";
import { Leaf, MapPin, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { ASSETS, FEATURED_HOME_CATEGORIES, itemImage } from "@/lib/assets";
import { SITE, directionsUrl, formatInr } from "@/lib/site";
import { FoodCard } from "@/components/food-card";
import { isRestaurantAcceptingOrders } from "@/lib/restaurant";

export default async function HomePage() {
  let settings: Awaited<ReturnType<typeof prisma.restaurantSettings.findUnique>> = null;
  let hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[] = [];
  let popular: Parameters<typeof FoodCard>[0]["item"][] = [];
  let thalis: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: { toNumber?: () => number } | number | string | null;
    images: { url: string; isPrimary?: boolean }[];
    category: { imageKey?: string | null; slug?: string };
  }> = [];
  let gallery: { id: string; url: string; alt: string }[] = [];
  let testimonials: { id: string; body: string; authorName: string }[] = [];
  try {
    const data = await Promise.all([
      prisma.restaurantSettings.findUnique({ where: { id: "default" } }),
      prisma.openingHours.findMany(),
      prisma.menuItem.findMany({
        where: { isPopular: true, availability: { not: "HIDDEN" } },
        include: { images: true, category: true },
        take: 8,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.menuItem.findMany({
        where: { slug: { in: ["vkf-classic-thali", "vkf-grand-thali", "vkf-signature-thali"] } },
        include: { images: true, category: true },
      }),
      prisma.galleryImage.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
      prisma.testimonial.findMany({ where: { isPublished: true }, take: 6 }),
    ]);
    settings = data[0];
    hours = data[1];
    popular = data[2].map((item) => ({ ...item, price: item.price === null ? null : Number(item.price) }));
    thalis = data[3];
    gallery = data[4];
    testimonials = data[5];
  } catch {
    /* Database not migrated yet — still render the brand homepage. */
  }

  const open = settings ? isRestaurantAcceptingOrders(settings, hours).open : true;
  const orderedThalis = ["vkf-classic-thali", "vkf-grand-thali", "vkf-signature-thali"]
    .map((slug) => thalis.find((t) => t.slug === slug))
    .filter(Boolean);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-8 pt-8 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:pt-12 lg:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-saffron">Opposite SHEPA College · Lathiya Bypass</p>
            <h1 className="font-display mt-4 max-w-xl text-5xl leading-[0.95] text-brick md:text-7xl">
              Authentic flavours of Kashi
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Vegetarian North Indian plates, tandoor, Indo-Chinese and thalis — cooked in Varanasi, ordered direct from the kitchen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/menu" className="rounded-full bg-brick px-6 py-3 text-sm text-cream">
                Order now
              </Link>
              <Link href="/menu" className="rounded-full border border-brick/20 px-6 py-3 text-sm">
                Explore menu
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-4 text-sm text-ink/80">
              <li className="flex items-center gap-2"><Leaf className="h-4 w-4 text-leaf" /> Pure vegetarian kitchen</li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-brick" /> Direct delivery</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brick" /> Bhikharipur Kala</li>
            </ul>
            {!open && (
              <p className="mt-4 text-sm text-brick">We&apos;re currently closed. You can still browse the menu.</p>
            )}
          </div>
          <div className="relative">
            <div className="absolute -left-6 top-8 hidden h-40 w-40 rounded-full bg-gold/20 blur-2xl md:block" />
            <Image
              src={ASSETS.hero}
              alt="A brass thali of vegetarian North Indian food"
              width={900}
              height={1080}
              priority
              className="relative z-10 aspect-[4/5] w-full rounded-[2.5rem] object-cover shadow-[0_30px_80px_rgba(74,29,18,0.28)] md:aspect-[5/6]"
            />
            <div className="absolute -bottom-5 left-6 z-20 rounded-2xl bg-brick px-4 py-3 text-cream shadow-xl">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Kitchen</p>
              <p className="font-display text-lg">11:00 AM – 12:30 AM</p>
            </div>
          </div>
        </div>
        <div className="mt-10 overflow-hidden border-y border-brick/10 py-3">
          <div className="ticker-track flex w-max gap-10 text-xs uppercase tracking-[0.35em] text-muted">
            {Array.from({ length: 2 }).map((_, i) => (
              <p key={i} className="flex gap-10">
                <span>Pure vegetarian</span>
                <span>Varanasi</span>
                <span>Thali · Tandoor · Chinese</span>
                <span>Order direct</span>
                <span>Opposite SHEPA College</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-saffron">The table</p>
            <h2 className="font-display mt-2 text-4xl text-brick">Start with a plate</h2>
          </div>
          <Link href="/menu" className="hidden text-sm text-brick underline-offset-4 hover:underline md:block">
            Full menu
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {FEATURED_HOME_CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/menu/${cat.slug}`}
              className={`group relative overflow-hidden rounded-[1.6rem] ${i === 0 || i === 5 ? "md:col-span-2 md:row-span-1 min-h-44" : "min-h-36"}`}
            >
              <img src={cat.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-ink/10" />
              <span className="absolute bottom-4 left-4 font-display text-2xl text-cream">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {orderedThalis.length > 0 && (
        <section className="bg-brick-deep py-16 text-cream">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <p className="text-xs uppercase tracking-[0.25em] text-gold">VKF thalis</p>
            <h2 className="font-display mt-2 max-w-xl text-4xl">Three complete meals, built the way this kitchen cooks.</h2>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {orderedThalis.map((item) =>
                item ? (
                  <Link key={item.id} href={`/menu/item/${item.slug}`} className="overflow-hidden rounded-[1.8rem] bg-brick">
                    <img src={itemImage(item)} alt={item.name} className="h-52 w-full object-cover" />
                    <div className="p-5">
                      <h3 className="font-display text-2xl">{item.name}</h3>
                      <p className="mt-2 text-sm text-cream/75">{item.description}</p>
                      <p className="mt-4 text-gold">{formatInr(item.price === null ? null : Number(item.price))}</p>
                    </div>
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-saffron">From the pass</p>
          <h2 className="font-display mt-2 text-4xl text-brick">Popular right now</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((item) => (
              <FoodCard
                key={item.id}
                item={{
                  ...item,
                  price: item.price === null ? null : Number(item.price),
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-brick/10 bg-white/70">
          <div className="grid md:grid-cols-5">
            {[
              ["Freshly prepared", "Dishes go out as they are cooked, not held under a lamp."],
              ["Authentic flavours", "North Indian gravies, tandoor and Banarasi-style plates."],
              ["Hygienic kitchen", "A pure vegetarian kitchen on Lathiya Bypass."],
              ["Fast delivery", "Order direct for the neighbourhood around SHEPA College."],
              ["Quality ingredients", "Paneer, dal, tandoor breads and Indo-Chinese staples."],
            ].map(([title, copy], i) => (
              <div key={title} className={`p-6 ${i < 4 ? "md:border-r md:border-brick/10" : ""}`}>
                <p className="font-display text-xl text-brick">{title}</p>
                <p className="mt-2 text-sm text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
        <img src={ASSETS.gallery.interior} alt="Dining room with brass tableware" className="h-[420px] w-full rounded-[2rem] object-cover" />
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-saffron">The restaurant</p>
          <h2 className="font-display mt-2 text-4xl text-brick">A vegetarian kitchen on the Varanasi bypass</h2>
          <p className="mt-4 text-muted">
            Vaibhav Kashi Foods cooks North Indian and Chinese vegetarian food at 448, opposite SHEPA College, Lathiya Bypass, Bhikharipur Kala. This site is the restaurant&apos;s own ordering counter — menu, cart and kitchen status, without a third-party app in between.
          </p>
          <p className="mt-4 text-muted">
            Come in for a thali, or send a tandoori platter, dal makhani and roti to the table at home. Public listings describe a pure vegetarian kitchen; opening hours and delivery area can be confirmed by the restaurant in the admin panel.
          </p>
          <Link href="/about" className="mt-6 inline-block text-sm text-brick underline-offset-4 hover:underline">
            Read the full note
          </Link>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-4xl text-brick">From the room</h2>
            <Link href="/gallery" className="text-sm text-brick">Gallery</Link>
          </div>
          <div className="mt-6 columns-2 gap-3 md:columns-3">
            {gallery.map((image) => (
              <img key={image.id} src={image.url} alt={image.alt} className="mb-3 w-full rounded-2xl object-cover" loading="lazy" />
            ))}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <h2 className="font-display text-4xl text-brick">From guests</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="rounded-3xl border border-brick/10 bg-white/80 p-5">
                <p className="text-muted">{t.body}</p>
                <footer className="mt-4 text-sm text-brick">{t.authorName}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-brick text-cream">
          <iframe
            title="Map of Vaibhav Kashi Foods"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(settings?.mapsQuery ?? SITE.mapsQuery)}&z=16&output=embed`}
            className="h-80 w-full grayscale-[0.2] contrast-125"
            loading="lazy"
          />
          <div className="absolute bottom-6 left-6 max-w-md rounded-2xl bg-paper p-5 text-ink shadow-xl">
            <p className="font-display text-2xl text-brick">{SITE.name}</p>
            <p className="mt-2 text-sm text-muted">{SITE.address.formatted}</p>
            <div className="mt-4 flex gap-3">
              <a href={directionsUrl(settings?.mapsQuery)} className="rounded-full bg-brick px-4 py-2 text-sm text-cream">
                Get directions
              </a>
              <a href={SITE.phoneHref} className="rounded-full border border-brick/20 px-4 py-2 text-sm">
                Call
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
