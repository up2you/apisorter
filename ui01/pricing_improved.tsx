import Head from 'next/head';
import Link from 'next/link';

import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'Forever',
    description: 'Perfect for discovering and exploring APIs.',
    features: [
      'Bookmark up to 20 APIs',
      'Email digests (monthly)',
      'Community reviews access',
      'Basic search & filtering',
      'API documentation links',
    ],
    cta: 'Start for free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    description: 'Stay ahead with proactive monitoring and insights.',
    features: [
      'Everything in Free',
      'Unlimited bookmarks',
      'Change alerts every 3 days',
      'CSV & JSON exports',
      'Slack / email notifications',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'Contact us',
    description: 'Scale with governance, collaboration, and advanced features.',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'SLA & dedicated support',
      'Webhook streaming',
      'SSO (SAML/OIDC)',
      'Custom integrations',
      'Advanced analytics',
    ],
    cta: 'Talk to sales',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing — API Sorter</title>
      </Head>
      <SiteHeader />
      <main className="relative">
        {/* 頁面頭部 */}
        <section className="container-max py-16 md:py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-accent">PRICING</span>
            </div>
            <h1 className="text-5xl font-extrabold text-white md:text-6xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Start for free, then unlock automated monitoring and enterprise workflows when you're ready.
            </p>
          </div>
        </section>

        {/* 定價卡片 */}
        <section className="container-max py-12">
          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`card flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                  tier.highlight
                    ? 'border-accent/60 shadow-lg md:scale-105'
                    : 'hover:border-white/10'
                }`}
              >
                {/* 高亮標籤 */}
                {tier.highlight && (
                  <div className="mb-4 inline-flex w-fit rounded-full bg-gradient-to-r from-accent to-highlight px-4 py-1.5">
                    <span className="text-xs font-bold text-midnight uppercase tracking-widest">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* 價格 */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                    <span className="text-sm text-gray-400">{tier.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">{tier.description}</p>
                </div>

                {/* CTA 按鈕 */}
                <button
                  className={`mb-8 w-full rounded-lg py-3 font-semibold transition-all duration-200 ${
                    tier.highlight
                      ? 'btn btn-primary'
                      : 'btn btn-secondary'
                  }`}
                >
                  {tier.cta}
                </button>

                {/* 功能列表 */}
                <div className="flex-1">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    What's included
                  </p>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs text-accent flex-shrink-0">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ 部分 */}
        <section className="container-max py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently asked questions
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: 'Can I change my plan later?',
                  a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
                },
                {
                  q: 'Is there a free trial for Pro?',
                  a: 'Yes, we offer a 14-day free trial for Pro users. No credit card required.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
                },
                {
                  q: 'Do you offer discounts for annual billing?',
                  a: 'Yes, save 20% when you switch to annual billing on any paid plan.',
                },
                {
                  q: 'What if I need more than what Pro offers?',
                  a: 'Contact our sales team to discuss custom Enterprise plans tailored to your needs.',
                },
              ].map((item, index) => (
                <details
                  key={index}
                  className="card group cursor-pointer p-6 transition-all duration-300"
                >
                  <summary className="flex items-center justify-between font-semibold text-white list-none">
                    <span>{item.q}</span>
                    <span className="text-accent group-open:rotate-180 transition-transform duration-300">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-400">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 底部 CTA */}
        <section className="container-max mb-12">
          <div className="card relative overflow-hidden p-12 text-center md:p-16">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent/10 via-transparent to-highlight/10" />

            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Join thousands of developers monitoring their favorite APIs.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button className="btn btn-primary btn-lg">
                Start for free
              </button>
              <Link href="/community" className="btn btn-secondary btn-lg">
                See what others are using
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
