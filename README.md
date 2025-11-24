# API Sorter — v1 (Enhanced)

This project bundle is ready for Cursor to scaffold into a full Next.js + Prisma app.

Main features:
- API catalog by category (AI, Cloud, Finance, Stock & Forex, etc.)
- API detail page with docs/pricing, examples, and changelog
- Rating & review system (anonymous posting with nickname)
- Auto API link updater with SHA256 hash comparison (runs every 3 days)
- Resend email notifications (from updates@apisorter.com)
- Stripe (USD) + Alipay + WeChat Pay integration placeholders
- Admin panel (CRUD APIs, moderate reviews, trigger crawler)
- Ad placeholders (728x90 header, 300x250 sidebar)

Quick start (for local dev):
1. Copy `.env.example` to `.env` and fill secrets.
2. `npm install`
3. `npx prisma generate`
4. `npx prisma db push`
5. `node prisma/seed.js` (or `npm run seed`)
6. `npm run dev`

Utility scripts:
- `npm run check-links` — run the automated crawler (uses Vercel cron logic)
- `npm run verify-links` — run link verification without sending notifications

To run the auto-update script manually:
