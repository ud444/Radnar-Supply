# Radnar Supply

Source. Supply. Personal shop. UK sourcing & supply business with a retail arm — premium fashion, footwear, accessories, fragrance and luxury goods. In-stock retail plus a personal shopping / sourcing service.

**Stack:** Next.js 15 (App Router · RSC · Server Actions) · Tailwind · Prisma · PostgreSQL · Stripe · Resend · UploadThing · TypeScript

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
| `NEXT_PUBLIC_SITE_URL` | Site origin, no trailing slash. Used by Stripe success/cancel redirects. |
| `AUTH_SECRET` | 64-char random hex — `openssl rand -hex 32`. Signs sessions and cart cookie. |
| `STRIPE_SECRET_KEY` | From dashboard.stripe.com → API keys (`sk_test_…` to start, `sk_live_…` on go-live) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from the webhook endpoint pointing at `${NEXT_PUBLIC_SITE_URL}/api/webhooks/stripe` |
| `RESEND_API_KEY` | From resend.com — also verify your sending domain |
| `EMAIL_FROM` | Must be on a verified Resend domain (use `onboarding@resend.dev` before verification) |
| `SOURCING_INBOX` | Where sourcing / personal-shopping enquiries are emailed (defaults to the `EMAIL_FROM` address) |
| `UPLOADTHING_TOKEN` | Single token from uploadthing.com → "API Keys" |
| `NEXT_PUBLIC_GA_ID` | Optional (`G-…`) |

---

## Deployment — Replit

1. **Replit** → New Repl → **Import from GitHub** → pick this repo. When asked to pick a template, choose **Node.js** (do NOT let Replit pick Vite/React — that overrides our `.replit`).
2. **Enable Replit's PostgreSQL** — Tools → Database → PostgreSQL. Replit auto-injects `DATABASE_URL` as a Secret. (Ignore the "External database detected" warning if you've previously set DATABASE_URL manually — remove that manual entry first so the built-in one takes over.)
3. **Resend** — create account, verify your sending domain, copy API key.
4. **Stripe** — create account, copy the secret key. Enable cards, Apple Pay, Google Pay, Klarna (and PayPal if desired) under Settings → Payment methods. Then create a webhook (see below) and copy its signing secret.
5. **UploadThing** — create app at uploadthing.com, copy the API token.
6. Add the remaining env vars as **Secrets** (everything except `DATABASE_URL`, which Replit provides):
   - `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `SOURCING_INBOX`, `UPLOADTHING_TOKEN`
7. In the Replit Shell:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
8. Hit **Run** — the `.replit` config runs `npm install && prisma db push && npm run build && npm start`.
9. Open the public URL and visit `/setup` to create the first admin.

### Custom domain
Replit → Deployments → Custom Domain. Update `NEXT_PUBLIC_SITE_URL` once attached.

### Stripe webhook
In the Stripe dashboard → Developers → Webhooks → **Add endpoint**:
- **URL:** `${NEXT_PUBLIC_SITE_URL}/api/webhooks/stripe`
- **Events:** `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
- Copy the endpoint's **Signing secret** (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

The webhook re-verifies signatures, marks the order paid (or releases reserved stock on expiry/failure), and is idempotent.

---

## Routes

### Storefront
- `/` Home (hero, brand marquee, personal shopping, categories, best sellers, Radnar Private, new in, Why Radnar)
- `/shop` PLP with filters (category, brand, size) + sort + search
- `/product/[slug]` PDP — gallery, variant picker, related
- `/sourcing` Personal shopping / sourcing request form (`?type=private` for RADNAR Private)
- `/blog`, `/blog/[slug]` SEO journal
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
- `/admin` dashboard (with new-request alert)
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
- `/admin/orders`, `/admin/orders/[id]`
- `/admin/requests`, `/admin/requests/[id]` — sourcing / personal-shopping tickets
- `/admin/content` — homepage content & media (CMS-lite)
- `/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]`
- `/admin/brands`, `/admin/categories`, `/admin/users`, `/admin/settings`

### API
- `POST /api/webhooks/stripe` — Stripe webhook (signature-verified; marks paid, releases stock on expiry/failure)
- `GET/POST /api/uploadthing` — UploadThing file router (`productImage`/`contentImage` admin-only, `sourcingImage` public)
- `POST /api/auth/logout` — destroys session

### SEO
- `/sitemap.xml`, `/robots.txt`

---

## Architecture notes

- **Sessions:** DB-backed (`Session` table) with HTTP-only signed cookies. Revocable. 30-day TTL.
- **Cart:** HMAC-signed cookie, server-side reads. Tamper-proof.
- **Pricing:** All amounts stored as integer pence. `money()` formats GBP.
- **Stock:** Decremented when an order is created (`PENDING`). Released by the Stripe webhook if the checkout session expires or payment fails.
- **Order totals:** Always recomputed server-side from variant IDs. Client subtotals are never trusted.
- **Payments:** Stripe Checkout (hosted). We create a Checkout Session with itemised line items, store `stripeSessionId`/`stripePaymentIntentId`, and confirm via the signature-verified webhook (idempotent).
- **Content/media:** Homepage copy + imagery are editable in `/admin/content`, stored in the `Setting` table (`home.content` / `home.media` JSON) with code-level defaults as fallback.
- **Images:** Direct-to-UploadThing uploads from the admin browser (signed by our auth middleware). DB stores `url` + `key` only.

---

## Future improvements

- Discount codes (model exists; add admin UI)
- Reviews / ratings
- Multi-region shipping + currency
- Wishlist
- Newsletter sync to Resend Audiences
- Postgres full-text search (`tsvector`) or Meilisearch
