import { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paths = [
    "",
    "/menu",
    "/about",
    "/gallery",
    "/contact",
    "/cart",
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-policy",
    "/shipping-and-delivery",
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/menu" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}

export const cuisine = SITE.cuisine;
