'use client';

import React, { useState } from 'react';
import { Check, Zap, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const PricingTable: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Anonymous',
      price: '$0',
      period: 'forever',
      description: 'Ideal for instant privacy, one-off signups, and avoiding spam newsletters.',
      popular: false,
      features: [
        'Instant disposable address generator',
        '60-minute default retention (extendable)',
        'Sub-second Cloudflare email ingestion',
        'Sandboxed HTML viewer & attachment download',
        'Mobile QR code sync',
        'Up to 3 concurrent active mailboxes',
      ],
      ctaText: 'Use Free Instantly',
      ctaHref: '#top',
      ctaVariant: 'secondary' as const,
    },
    {
      id: 'pro',
      name: 'OmniMail Pro',
      price: annual ? '$7' : '$9',
      period: 'per month',
      description: 'For power users, QA automation engineers, and developers building SaaS.',
      popular: true,
      features: [
        'Unlimited concurrent mailboxes',
        'Extended 30-day email retention',
        'Custom aliases & vanity usernames',
        'Exclusive premium domains (@omnimail.app)',
        'Full Developer REST API with API keys',
        'Webhook forwarding to Slack / Discord / Webhook',
        'Priority Cloudflare edge routing queue',
      ],
      ctaText: 'Upgrade to Pro',
      ctaHref: '/auth/register?plan=pro',
      ctaVariant: 'glow' as const,
    },
    {
      id: 'enterprise',
      name: 'OmniBey Suite',
      price: annual ? '$39' : '$49',
      period: 'per month',
      description: 'Custom email routing infrastructure and AI workflows for growing teams.',
      popular: false,
      features: [
        'Connect unlimited custom domains with Cloudflare',
        'Permanent or custom retention policies',
        'AI Email Summary & OTP auto-extractor',
        'Gmail & Outlook bidirectional integration',
        'Dedicated Cloudflare Worker instance',
        '99.99% Uptime SLA & 24/7 Priority Support',
        'Team members & role-based access control',
      ],
      ctaText: 'Contact Enterprise',
      ctaHref: '/auth/register?plan=enterprise',
      ctaVariant: 'secondary' as const,
    },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Transparent SaaS Pricing
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
          Simple, Predictable Plans For Everyone
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          Get started 100% free with no account required. Upgrade when you need APIs, extended retention, or custom domains.
        </p>

        {/* Annual Billing Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setAnnual(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !annual ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              annual ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual (Save 20%)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
              Popular
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
              p.popular
                ? 'bg-slate-900 border-2 border-indigo-500/80 shadow-2xl shadow-indigo-500/10 scale-105 z-10'
                : 'glass-card border border-slate-800 hover:border-slate-700'
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-[11px] font-bold text-white shadow-md">
                MOST POPULAR
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                {p.popular && <Sparkles className="w-5 h-5 text-indigo-400" />}
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">{p.price}</span>
                <span className="text-xs text-slate-400">/{p.period}</span>
              </div>

              <p className="text-xs text-slate-400 mb-6 leading-relaxed">{p.description}</p>

              <div className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href={p.ctaHref} className="w-full">
              <Button variant={p.ctaVariant} size="md" className="w-full">
                {p.ctaText} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
