import React from 'react';
import { Globe, Server, Database, ShieldCheck, Cpu, CheckCircle2 } from 'lucide-react';

export const ArchitectureShowcase: React.FC = () => {
  return (
    <section id="architecture" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            System Design &amp; Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
            Built To Scale Without Rewrites
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            OmniBey isolates edge ingestion, persistence, and client interfaces behind a strict modular abstraction layer.
          </p>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative mb-12">
          {/* Step 1: Internet & Cloudflare */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Edge Ingestion</span>
                <Globe className="w-5 h-5 text-sky-500" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Cloudflare Email Worker</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Catches all emails sent to <code className="text-sky-600 dark:text-sky-300 font-mono">@mail.omnibey.com</code> at edge POPs, validates SPF/DKIM headers, and streams to webhook.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sub-100ms Edge Latency
            </div>
          </div>

          {/* Step 2: Next.js API Router */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Core Gateway</span>
                <Server className="w-5 h-5 text-indigo-500" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Next.js App Router Ingestion</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Authenticates HMAC bearer secret, invokes MIME parser, extracts OTP verification codes, and checks mailbox status in real time.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> MailProvider Interface
            </div>
          </div>

          {/* Step 3: Supabase Storage & DB */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Storage &amp; RLS</span>
                <Database className="w-5 h-5 text-emerald-500" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Supabase PostgreSQL &amp; Bucket</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stores structured email tables with Row Level Security. Attachments upload to Supabase Storage with auto-purge cascade.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Row Level Security Enforced
            </div>
          </div>

          {/* Step 4: Client & Realtime */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Client Delivery</span>
                <ShieldCheck className="w-5 h-5 text-purple-500" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">OmniMail Interactive Inbox</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Responsive split-pane client displays email content safely sandboxed with instant OTP banners, QR codes, and timer controls.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Instant OTP Highlights
            </div>
          </div>
        </div>

        {/* Future Modularity Extensibility Card */}
        <div className="rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Cpu className="w-4 h-4" />
                <span>Extensible Architecture Ready</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Designed For Future Gmail, Outlook &amp; AI Integrations
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                The codebase uses a standardized <code className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">MailProvider</code> contract.
                Connecting Google Workspace (Gmail API) or Microsoft Office 365 (Graph API) requires only configuring their provider adapter without refactoring user databases, ingestion endpoints, or client interfaces.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Cloudflare Active
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Gmail Pluggable
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Outlook Pluggable
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
