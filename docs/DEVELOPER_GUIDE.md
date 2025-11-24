# DEVELOPER_GUIDE.md — API Sorter

Project summary:
- Domain: https://www.apisorter.com
- Goal: central hub for APIs, searchable, with reviews and automatic link/pricing monitoring.

Required file structure (Cursor should create):
- /src (pages/components)
- /prisma/schema.prisma
- /db/init.sql
- /scripts/crawler.js
- /scripts/verifyLinks.js
- /templates/api_struct_template.json

Data model highlights (Prisma):
- `User` / `Subscription` / `Payment`: 支援 Stripe + 方案管理，`User.role` 為 `USER|ADMIN|MODERATOR`
- `Provider` / `Api`: `Api` 具 `slug`, `tags`, `status`, `source`, `featured`, `metadata`
- `Review`: 匿名暱稱 + `ipHash` 追蹤、防刷星，`rating` 1~5
- `PricingHistory`: 紀錄 hash、diff、來源，並可追蹤異動者
- `Favorite` / `ApiFollower`: 收藏與變更通知名單
- `AdSlot` / `AdCampaign`: 首頁與細頁廣告位設定
- `WebhookEvent`: Stripe / Resend webhook 紀錄

Key endpoints to implement:
- GET /api/catalog?category=&q=&free=&page=
- GET /api/apis/:id
- GET /api/reviews/:apiId
- POST /api/reviews (anonymous allowed; requires nickname string)
- DELETE /api/reviews/:id (owner or admin)
- POST /api/subscribe (Stripe Checkout)
- POST /api/webhooks/stripe
- POST /api/cron/check-links (invoked by Vercel Cron)

Crawler behavior:
- HEAD docsUrl → detect 4xx/5xx or redirect.
- If redirect → update DB docsUrl and notify admin.
- GET docsUrl content → compute SHA256 hash.
- If hash != lastHash → insert record into PricingHistory, update lastHash, notify followers/admin.

Seeding & migrations:
- Run `npm run prisma:generate` then `npm run prisma:push`
- Execute `npm run seed`（對應 `prisma/seed.js`）建立 Provider / API / User / Plan / 廣告等初始資料
- 若需純 SQL 方式，可於 Neon 控制台執行 `db/init.sql`

Review behavior:
- Allow anonymous reviews: client sends `{ apiId, nickname, rating, comment }`.
- Server stores nickname (string) and rating (1..5).
- Average rating computed on read (no materialized column required).

Deployment recommendations:
- Start with Vercel Hobby + Neon Free + Resend Free.
- Set scheduler to run `POST /api/cron/check-links` every 3 days.
- When growing, upgrade Vercel/Neon/Resend in that order.

Frontend highlights:
- Next.js pages router + TailwindCSS (global styles in `src/styles/globals.css`).
- Layout components: `SiteHeader`, `SiteFooter`, `ApiCard`, `AdSlot`, `CategoryBadge`.
- Pages:
  - `/` hero + featured APIs + review spotlight (SEO-friendly SSR via Prisma).
  - `/category/[name]` filtered catalog (supports query params `q` & `free`).
  - `/api/[slug]` API detail (rewrite to `/apis/[slug]` to avoid API route conflict).
- Client components handle interactivity: `RatingStars.client`, `ReviewList.client`, `AddReviewForm.client` (anonymous review flow).

Cursor starter prompts:
1. "Scaffold Next.js TypeScript project with Tailwind and the folder structure listed."
2. "Add Prisma schema and seed from db/init.sql."
3. "Implement API routes and frontend pages (homepage, category, API detail with reviews)."
4. "Add scripts/crawler.js and the /api/cron/check-links route for scheduled runs."
