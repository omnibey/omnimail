'use client';

import React from 'react';
import { HeroSection } from '@/components/marketing/HeroSection';
import { InboxView } from '@/components/omnimail/InboxView';
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid';
import { ArchitectureShowcase } from '@/components/marketing/ArchitectureShowcase';
import { PricingTable } from '@/components/marketing/PricingTable';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function HomePage() {
  const faqs = [
    {
      q: 'What is OmniMail by OmniBey?',
      a: 'OmniMail is an enterprise-grade temporary disposable email platform built on the OmniBey ecosystem. It allows you to create instant email addresses on omnibey.com to receive verification codes, test apps, or protect your personal inbox from spam.',
    },
    {
      q: 'How long do temporary email addresses and messages last?',
      a: 'By default, temporary mailboxes remain active for 60 minutes. You can easily extend this timer by clicking "+60m" as many times as you need. When a mailbox expires, its messages and attachments are automatically deleted from PostgreSQL and storage.',
    },
    {
      q: 'How does Cloudflare Email Routing work in OmniMail?',
      a: 'OmniMail runs a Cloudflare Email Worker at the edge. When an email is sent to any address at omnibey.com, Cloudflare receives it, performs SPF/DKIM verification checks, and forwards the payload via secure webhook to our ingestion API in under 100 milliseconds.',
    },
    {
      q: 'Can developers automate this with an API?',
      a: 'Yes! OmniMail provides a clean REST API. You can create mailboxes, list messages, and retrieve 2FA authentication codes programmatically in your automated Playwright, Cypress, or Selenium test suites.',
    },
    {
      q: 'Is OmniMail really secure and private?',
      a: 'Yes. OmniMail does not require any personal information or registration to use. All HTML emails are sanitized to eliminate malicious JavaScript and tracking pixels. Data is protected by PostgreSQL Row Level Security (RLS) and purged upon expiration.',
    },
    {
      q: 'Can I connect custom domains or Gmail/Outlook?',
      a: 'Yes! OmniBey is designed with a pluggable MailProvider interface. Pro and Enterprise users can add custom domains, and our architecture allows connecting Gmail or Outlook providers seamlessly without rewriting core logic.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero & Interactive Temporary Mailbox */}
      <section className="relative pt-6 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <HeroSection />

        {/* Temporary Email Application Centerpiece */}
        <div className="mt-4 max-w-6xl mx-auto">
          <InboxView />
        </div>
      </section>

      {/* Production Features Grid */}
      <FeaturesGrid />

      {/* Architecture & Pipeline Showcase */}
      <ArchitectureShowcase />

      {/* Pricing Table */}
      <PricingTable />

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 tracking-tight">
            Got Questions? We Have Answers
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group glass-card rounded-2xl border border-slate-800 p-5 open:bg-slate-900/80 transition-colors"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm sm:text-base text-slate-100 group-hover:text-sky-300 transition-colors">
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  {item.q}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed pl-6 border-l border-slate-800">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
