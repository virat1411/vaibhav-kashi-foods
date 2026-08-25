import { PrismaClient, SpiceLevel } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_CATEGORIES, slugify } from "./data/menu";

const prisma = new PrismaClient();

function spice(level?: string): SpiceLevel {
  if (level === "MILD" || level === "MEDIUM" || level === "HOT") return level;
  return "NONE";
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@vaibhavkashifoods.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMeNow!VKF";

  await prisma.restaurantSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Vaibhav Kashi Foods",
      legalName: "Vaibhav Kashi Foods LLP",
      phone: "+91 8437360273",
      email: null,
      addressLine1: "448, Opposite SHEPA College, Lathiya Bypass",
      addressLine2: "Bhikharipur Kala",
      city: "Varanasi",
      state: "Uttar Pradesh",
      pincode: "221011",
      country: "India",
      logoUrl: "/images/logo/logo.png",
      instagramUrl: "https://www.instagram.com/vaibhavkashifoods/",
      linkedinUrl: "https://in.linkedin.com/company/vaibhavkashifoods-llp/",
      whatsappNumber: "918437360273",
      whatsappOrderingEnabled: true,
      mapsQuery: "448 Opposite SHEPA College Lathiya Bypass Bhikharipur Kala Varanasi Uttar Pradesh 221011",
      openStatus: "OPEN",
      useScheduledHours: true,
      deliveryFee: 0,
      minOrder: 0,
      freeDeliveryThreshold: null,
      taxPercent: 0,
      currency: "INR",
      deliveryRadiusKm: null,
      estimatedDeliveryMinutes: 45,
    },
  });

  const hours = [
    { dayOfWeek: 0, openTime: "11:00", closeTime: "00:30" },
    { dayOfWeek: 1, openTime: "11:00", closeTime: "00:30" },
    { dayOfWeek: 2, openTime: "11:00", closeTime: "00:30" },
    { dayOfWeek: 3, openTime: "11:00", closeTime: "00:30" },
    { dayOfWeek: 4, openTime: "11:00", closeTime: "00:30" },
    { dayOfWeek: 5, openTime: "11:00", closeTime: "00:30" },
    { dayOfWeek: 6, openTime: "11:00", closeTime: "00:30" },
  ];

  for (const h of hours) {
    await prisma.openingHours.upsert({
      where: { dayOfWeek: h.dayOfWeek },
      update: { openTime: h.openTime, closeTime: h.closeTime, isClosed: false },
      create: { ...h, isClosed: false },
    });
  }

  await prisma.deliveryZone.upsert({
    where: { id: "varanasi-core" },
    update: {},
    create: {
      id: "varanasi-core",
      name: "Varanasi (to be confirmed)",
      isActive: true,
      pincodes: ["221011"],
      note: "TODO: restaurant must confirm serviceable pincodes, delivery fee, free-delivery threshold and tax rate.",
    },
  });

  const legalPages = [
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content:
        "This page describes how Vaibhav Kashi Foods may collect and use information when you order from this website. Contact, address and order details are used only to fulfil and support your order. This text is a placeholder for restaurant and legal review and is not legal advice.",
    },
    {
      slug: "terms-and-conditions",
      title: "Terms and Conditions",
      content:
        "By placing an order you agree that menu availability, prices, delivery area and restaurant hours are as configured by Vaibhav Kashi Foods at the time of checkout. This text is a placeholder for restaurant and legal review and is not a binding legal document until reviewed.",
    },
    {
      slug: "refund-policy",
      title: "Refund Policy",
      content:
        "If an item is unavailable or an order cannot be fulfilled, the restaurant will contact you. Refund handling for online payments will follow the payment provider and restaurant policy once those details are confirmed. This text is a placeholder for restaurant and legal review.",
    },
    {
      slug: "shipping-and-delivery",
      title: "Shipping and Delivery",
      content:
        "Vaibhav Kashi Foods delivers to configured pincodes around the restaurant at 448, Opposite SHEPA College, Lathiya Bypass, Bhikharipur Kala, Varanasi. Delivery charges, minimum order and estimated time are set in restaurant settings. Pickup and delivery rules should be confirmed by the restaurant before go-live.",
    },
  ];

  for (const page of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  const gallery = [
    { url: "/images/gallery/thalis.png", alt: "Signature vegetarian thalis", kind: "FOOD" as const, sortOrder: 1 },
    { url: "/images/hero/hero.png", alt: "A brass thali of North Indian vegetarian food", kind: "FOOD" as const, sortOrder: 2 },
    { url: "/images/gallery/interior.png", alt: "Warm dining room with brass tableware", kind: "AMBIENCE" as const, sortOrder: 3 },
    { url: "/images/categories/tandoori.png", alt: "Tandoori vegetarian platter", kind: "FOOD" as const, sortOrder: 4 },
    { url: "/images/categories/main-course.png", alt: "North Indian vegetarian curries", kind: "FOOD" as const, sortOrder: 5 },
    { url: "/images/menu/kheer.png", alt: "Kesar kheer", kind: "FOOD" as const, sortOrder: 6 },
  ];

  if ((await prisma.galleryImage.count()) === 0) {
    await prisma.galleryImage.createMany({ data: gallery });
  }

  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      mustChangePassword: true,
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: "Restaurant Admin",
      passwordHash: hash,
      role: "ADMIN",
      mustChangePassword: true,
    },
  });

  for (const category of SEED_CATEGORIES) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        imageKey: category.imageKey,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageKey: category.imageKey,
        sortOrder: category.sortOrder,
      },
    });

    for (const [index, item] of category.items.entries()) {
      const itemSlug = slugify(item.name);
      await prisma.menuItem.upsert({
        where: { slug: itemSlug },
        update: {
          name: item.name,
          description: item.description,
          descriptionGenerated: true,
          categoryId: saved.id,
          spiceLevel: spice(item.spiceLevel),
          isPopular: Boolean(item.isPopular),
          isFeatured: Boolean(item.isFeatured),
          isRecommended: Boolean(item.isRecommended),
          isVegetarian: true,
          prepTimeMinutes: item.prepTimeMinutes ?? null,
          sortOrder: (index + 1) * 10,
        },
        create: {
          name: item.name,
          slug: itemSlug,
          description: item.description,
          descriptionGenerated: true,
          price: null,
          categoryId: saved.id,
          spiceLevel: spice(item.spiceLevel),
          isPopular: Boolean(item.isPopular),
          isFeatured: Boolean(item.isFeatured),
          isRecommended: Boolean(item.isRecommended),
          isVegetarian: true,
          prepTimeMinutes: item.prepTimeMinutes ?? null,
          sortOrder: (index + 1) * 10,
        },
      });
    }
  }

  const paneerButter = await prisma.menuItem.findUnique({ where: { slug: "paneer-butter-masala" } });
  if (paneerButter) {
    const existingGroups = await prisma.menuItemOptionGroup.count({ where: { menuItemId: paneerButter.id } });
    if (existingGroups === 0) {
      await prisma.menuItemOptionGroup.create({
        data: {
          menuItemId: paneerButter.id,
          name: "Spice level",
          required: false,
          minSelect: 0,
          maxSelect: 1,
          options: {
            create: [
              { name: "Mild", priceDelta: 0, sortOrder: 1 },
              { name: "Medium", priceDelta: 0, sortOrder: 2 },
              { name: "Hot", priceDelta: 0, sortOrder: 3 },
            ],
          },
        },
      });
    }
    const existingAddons = await prisma.menuItemAddon.count({ where: { menuItemId: paneerButter.id } });
    if (existingAddons === 0) {
      await prisma.menuItemAddon.createMany({
        data: [
          { menuItemId: paneerButter.id, name: "Extra butter", price: 0, sortOrder: 1 },
          { menuItemId: paneerButter.id, name: "Extra paneer", price: 0, sortOrder: 2 },
        ],
      });
    }
  }

  console.log("Seed complete.");
  console.log("Admin email:", adminEmail);
  console.log("Prices are unset (null) until the restaurant confirms them in admin.");
  console.log("TODO: confirm opening hours (seeded 11:00–00:30 from public listings), tax, delivery fee, pincodes and item prices.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
