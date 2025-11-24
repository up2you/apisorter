# Deployment Tiers Guide (API Sorter)

Free (development)
- Vercel Hobby: $0/month — suitable for dev and small traffic
- Neon Free: 0.5GB storage, limited connections
- Resend Free: 3,000 emails/month

Pro (growth)
- Vercel Pro: $20/month
- Neon Standard: $15–$30/month (depending on resources)
- Resend Growth: $10/month

Upgrade triggers:
- DB size > 1GB or connections exhausted → upgrade Neon
- Need cron frequency > once per 3 days or more concurrency → upgrade Vercel
- Email volume > free tier → upgrade Resend
