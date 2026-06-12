# Radnar Supply

Designer apparel, footwear, accessories, and fragrance — verified, always below retail. Out of Birmingham, UK.

**Stack:** Next.js 15 (App Router · RSC · Server Actions) · Tailwind · Prisma · PostgreSQL · Mollie · Resend · UploadThing · TypeScript

---

## Quick start (local)

```bash
cp .env.example .env       # fill in real values
npm install
npx prisma db push         # creates tables on your Postgres
npm run db:seed            # 16 placeholder products, 6 brands, 4 categories
npm run dev                # http://localhost:3000
```

Then open `http://localhost:3000/setup` and create the first admin account.

---

## Environment variables

| Key | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. On Replit this is auto-injected by the built-in Database. |
| `NEXT_PUBLIC_SITE_URL` | Site origin, no trailing slash. Used by Mollie redirects + webhooks. |
| `AUTH_SECRET` | 64-char random hex — `openssl rand -hex 32`. Signs sessions and cart cookie. |
| `MOLLIE_API_KEY` | `test_…` to start, `live_…` on go-live |
| `RESEND_API_KEY` | From resend.com — also verify your sending domain |
| `EMAIL_FROM` | Must be on a verified Resend domain (use `onboarding@resend.dev` before verification) |
| `UPLOADTHING_TOKEN` | Single token from uploadthing.com → "API Keys" |
| `NEXT_PUBLIC_GA_ID` | Optional (`G-…`) |

---

## Deployment — Replit

1. **Replit** → New Repl → **Import from GitHub** → pick this repo. When asked to pick a template, choose **Node.js** (do NOT let Replit pick Vite/React — that overrides our `.replit`).
2. **Enable Replit's PostgreSQL** — Tools → Database → PostgreSQL. Replit auto-injects `DATABASE_URL` as a Secret. (Ignore the "External database detected" warning if you've previously set DATABASE_URL manually — remove that manual entry first so the built-in one takes over.)
3. **Resend** — create account, verify your sending domain, copy API key.
4. **Mollie** — create account, generate a test API key. Enable cards, Apple Pay, Google Pay, PayPal, Klarna in your Mollie profile.
5. **UploadThing** — create app at uploadthing.com, copy the API token.
6. Add the remaining env vars as **Secrets** (everything except `DATABASE_URL`, which Replit provides):
   - `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`, `MOLLIE_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `UPLOADTHING_TOKEN`
7. In the Replit Shell:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
8. Hit **Run** — the `.replit` config runs `npm install && prisma db push && npm run build && npm start`.
9. Open the public URL and visit `/setup` to create the first admin.

### Custom domain
Replit → Deployments → Custom Domain. Update `NEXT_PUBLIC_SITE_URL` once attached.

### Mollie webhook
No manual config — every payment we create includes `webhookUrl = ${NEXT_PUBLIC_SITE_URL}/api/webhooks/mollie`.

---

## Routes

### Storefront
- `/` Home (hero, categories, best sellers, new in)
- `/shop` PLP with filters (category, brand, size) + sort + search
- `/product/[slug]` PDP — gallery, variant picker, related
- `/cart`, `/checkout`, `/checkout/success`, `/checkout/cancelled`
- `/about`, `/policies/{shipping,returns,privacy,terms}`

### Auth
- `/login`, `/register`, `/forgot`, `/reset/[token]`

### Account (auth required)
- `/account` dashboard
- `/account/orders`, `/account/orders/[id]`
- `/account/addresses`

### Setup (one-time)
- `/setup` — self-disabling first-admin creation

### Admin (admin role required)
- `/admin` dashboard
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
- `/admin/orders`, `/admin/orders/[id]`
- `/admin/brands`, `/admin/categories`, `/admin/users`, `/admin/settings`

### API
- `POST /api/webhooks/mollie` — Mollie payment webhook (re-fetches from Mollie, updates order, releases stock on cancel)
- `GET/POST /api/uploadthing` — UploadThing file router (admin-only)
- `POST /api/auth/logout` — destroys session

### SEO
- `/sitemap.xml`, `/robots.txt`

---

## Architecture notes

- **Sessions:** DB-backed (`Session` table) with HTTP-only signed cookies. Revocable. 30-day TTL.
- **Cart:** HMAC-signed cookie, server-side reads. Tamper-proof.
- **Pricing:** All amounts stored as integer pence. `money()` formats GBP.
- **Stock:** Decremented when an order is created (`PENDING`). Released by the Mollie webhook if payment is cancelled/expired/failed.
- **Order totals:** Always recomputed server-side from variant IDs. Client subtotals are never trusted.
- **Webhook:** Idempotent — re-fetches payment status from Mollie, returns 200 even on unknown payment IDs so Mollie stops retrying.
- **Images:** Direct-to-UploadThing uploads from the admin browser (signed by our auth middleware). DB stores `url` + `key` only.

---

## Future improvements

- Discount codes (model exists; add admin UI)
- Reviews / ratings
- Multi-region shipping + currency
- Wishlist
- Newsletter sync to Resend Audiences
- Postgres full-text search (`tsvector`) or Meilisearch
