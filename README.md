# Vaibhav Kashi Foods — Direct Ordering

Independent food-ordering website for **Vaibhav Kashi Foods**, a vegetarian restaurant at 448, Opposite SHEPA College, Lathiya Bypass, Bhikharipur Kala, Varanasi.

This is not a marketplace clone. Customers order from the restaurant's own menu, cart, checkout and kitchen board.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- PostgreSQL + Prisma
- Session auth (signed HTTP-only JWT cookies, bcrypt passwords)
- Razorpay + Cash on Delivery
- Docker Compose for local Postgres

## Project structure

```
prisma/                 schema + seed
src/app/(site)/         customer site
src/app/admin/          kitchen dashboard
src/app/api/            REST API
src/lib/                pricing, auth, payments, notifications
public/images/          brand + category assets (central mapping in src/lib/assets.ts)
```

## Database

Normalized PostgreSQL models include User, Address, Category, MenuItem, images/options/addons, Cart, Order, Payment, Coupon, Favorite, RestaurantSettings, OpeningHours, DeliveryZone, Notification, Gallery and legal pages.

Order totals are **never** taken from the browser. The server loads live prices from PostgreSQL and computes subtotal, coupon, tax, delivery and grand total.

## Features

Customer: homepage, dynamic menu, search/filters, item customizations, cart, checkout, COD, Razorpay architecture, order tracking, accounts, addresses, favorites, WhatsApp order link, contact form, PWA.

Admin (`/admin`): dashboard, orders and status flow, menu CRUD, prices, availability, images, categories, customers, coupons, restaurant settings (hours, tax, delivery fee, pincodes, open/closed).

## Admin credentials

Set in `.env` (never commit real passwords):

```
ADMIN_EMAIL=admin@vaibhavkashifoods.local
ADMIN_PASSWORD=ChangeMeNow!VKF
```

The seeded admin has `mustChangePassword=true`. Change it after first login at `/account/settings`.

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Session signing secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Server-side Razorpay |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Checkout key only |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional default WhatsApp |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Optional; directions still work via address search |

## Run locally

1. Install Node.js 20+ and Docker (or any PostgreSQL 16).
2. `cp .env.example .env` and generate `AUTH_SECRET` (`openssl rand -base64 32`).
3. Start the database:

```bash
docker compose up -d
```

4. Install and migrate:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

## Migrations and seed

```bash
npm run db:migrate          # prisma migrate dev
npm run db:migrate:deploy   # production
npm run db:seed
```

Seeded menu prices are `null` until the restaurant enters them in `/admin/menu`. Unpriced items cannot be added to a checkout.

## Razorpay

1. Create a Razorpay account and get Key ID + Key Secret.
2. Put the secret **only** in `RAZORPAY_KEY_SECRET` (server).
3. Put the publishable key in `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_ID`.
4. Checkout creates a Razorpay order on the server; payment success is accepted only after HMAC signature verification in `POST /api/payments/verify`.

Without keys, Cash on Delivery still works. Online pay shows a clear configuration error.

## Deploy

1. Provision PostgreSQL (Neon, RDS, Cloud SQL, etc.).
2. Set all environment variables on the host (Vercel, Railway, Fly, a VPS).
3. `npx prisma migrate deploy && npm run db:seed && npm run build && npm start`.
4. Point the domain, set `NEXT_PUBLIC_SITE_URL`, and confirm webhook/signature secrets.

Example `Dockerfile` is included for a Node server deploy.

## Information still required from Vaibhav Kashi Foods

- Confirmed item prices (all seeded as unset on purpose)
- Tax percentage
- Delivery fee, minimum order, free-delivery threshold
- Full list of serviceable pincodes
- Confirmation of opening hours (seeded 11:00–00:30 from public listings)
- Restaurant email
- Official logo file if they prefer their own mark
- Authorized food photography to replace generated category images
- Whether the Assi Ghat outlet should be a second branch later

## Research notes

Used publicly available information only. Prices were **not** copied from Zomato/Swiggy. Images are original generated brand/food photography, not scraped from aggregator platforms. Testimonials are not fabricated; the homepage section appears only when admin publishes reviews.
