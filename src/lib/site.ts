export const SITE = {
  name: "Vaibhav Kashi Foods",
  shortName: "VKF",
  legalName: "Vaibhav Kashi Foods LLP",
  tagline: "Authentic Flavours of Kashi",
  description:
    "Order vegetarian North Indian food, Chinese dishes, thalis, snacks and beverages from Vaibhav Kashi Foods in Varanasi.",
  phone: "+91 8437360273",
  phoneHref: "tel:+918437360273",
  instagram: "https://www.instagram.com/vaibhavkashifoods/",
  linkedin: "https://in.linkedin.com/company/vaibhavkashifoods-llp/",
  address: {
    line1: "448, Opposite SHEPA College, Lathiya Bypass",
    line2: "Bhikharipur Kala",
    city: "Varanasi",
    state: "Uttar Pradesh",
    pincode: "221011",
    country: "India",
    formatted:
      "448, Opposite SHEPA College, Lathiya Bypass, Bhikharipur Kala, Varanasi, Uttar Pradesh 221011, India",
  },
  mapsQuery:
    "448 Opposite SHEPA College Lathiya Bypass Bhikharipur Kala Varanasi Uttar Pradesh 221011",
  cuisine: ["North Indian", "Chinese", "Vegetarian"],
  currency: "INR",
} as const;

export function directionsUrl(query: string = SITE.mapsQuery) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsEmbedUrl(query: string = SITE.mapsQuery) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

export function formatInr(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return "Price on request";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2,
  }).format(Number(amount));
}

export function paise(amount: number) {
  return Math.round(amount * 100);
}
