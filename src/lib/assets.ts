export const ASSETS = {
  logo: "/images/logo/logo.png",
  icon: "/images/icons/icon-512.png",
  hero: "/images/hero/hero.png",
  thalis: "/images/gallery/thalis.png",
  gallery: {
    interior: "/images/gallery/interior.png",
    kheer: "/images/menu/kheer.png",
  },
  categories: {
    breakfast: "/images/categories/breakfast.png",
    thali: "/images/gallery/thalis.png",
    platter: "/images/categories/tandoori.png",
    soups: "/images/categories/soups.png",
    salads: "/images/categories/starters.png",
    starters: "/images/categories/starters.png",
    mainCourse: "/images/categories/main-course.png",
    breads: "/images/categories/breads.png",
    biryani: "/images/categories/biryani.png",
    rice: "/images/categories/biryani.png",
    noodles: "/images/categories/noodles.png",
    friedRice: "/images/categories/noodles.png",
    snacks: "/images/categories/snacks.png",
    accompaniments: "/images/categories/main-course.png",
    sweets: "/images/menu/kheer.png",
    drinks: "/images/categories/drinks.png",
  },
} as const;

const CATEGORY_KEY_MAP: Record<string, string> = {
  "category.breakfast": ASSETS.categories.breakfast,
  "category.thali": ASSETS.categories.thali,
  "category.platter": ASSETS.categories.platter,
  "category.soups": ASSETS.categories.soups,
  "category.salads": ASSETS.categories.salads,
  "category.starters": ASSETS.categories.starters,
  "category.mainCourse": ASSETS.categories.mainCourse,
  "category.breads": ASSETS.categories.breads,
  "category.biryani": ASSETS.categories.biryani,
  "category.rice": ASSETS.categories.rice,
  "category.noodles": ASSETS.categories.noodles,
  "category.friedRice": ASSETS.categories.friedRice,
  "category.snacks": ASSETS.categories.snacks,
  "category.accompaniments": ASSETS.categories.accompaniments,
  "category.sweets": ASSETS.categories.sweets,
  "category.drinks": ASSETS.categories.drinks,
};

export function resolveAsset(key?: string | null, fallback = ASSETS.hero) {
  if (!key) return fallback;
  if (key.startsWith("/")) return key;
  return CATEGORY_KEY_MAP[key] ?? fallback;
}

export function itemImage(item: {
  images?: { url: string; isPrimary?: boolean }[];
  category?: { imageKey?: string | null; slug?: string };
}) {
  const primary = item.images?.find((img) => img.isPrimary) ?? item.images?.[0];
  if (primary?.url) return primary.url;
  if (item.category?.imageKey) return resolveAsset(item.category.imageKey);
  return ASSETS.hero;
}

export const FEATURED_HOME_CATEGORIES = [
  { slug: "thali", label: "Thali", image: ASSETS.categories.thali },
  { slug: "main-course", label: "North Indian", image: ASSETS.categories.mainCourse },
  { slug: "noodles", label: "Chinese", image: ASSETS.categories.noodles },
  { slug: "starters", label: "Starters", image: ASSETS.categories.starters },
  { slug: "breads", label: "Breads", image: ASSETS.categories.breads },
  { slug: "biryani", label: "Rice & Biryani", image: ASSETS.categories.biryani },
  { slug: "snacks", label: "Snacks", image: ASSETS.categories.snacks },
  { slug: "beverages", label: "Beverages", image: ASSETS.categories.drinks },
] as const;
