import React from 'react';
import { ShieldCheck, Lock, Trash2, EyeOff } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — OmniMail by OmniBey',
  description: 'Our zero-retention and zero-tracking privacy guarantee.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 text-slate-600 dark:text-slate-300">
      <div className="pb-8 border-b border-slate-200 dark:border-slate-800 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Effective Date: October 2, 2026 &bull; OmniBey Inc. (omnibey.com)</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 dark:text-white block mb-1">Our Core Commitment: Zero Log Retention</strong>
            OmniMail was engineered specifically to protect personal privacy and prevent spam. We do not sell user data, we do not log IP addresses to message records, and we automatically purge expired mailboxes and emails.
          </div>
        </div>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Information We Do Not Collect</h2>
          <p>
            When you use the anonymous tier of OmniMail, we do not ask for your real name, physical address, phone number, or payment details. No account registration is required to receive mail.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Automated Data Purging</h2>
          <p>
            All messages, raw headers, and attachments associated with temporary disposable mailboxes are subject to an automatic TTL (Time To Live). When a mailbox expires, records are permanently deleted from PostgreSQL and Supabase Storage via automated background purge routines.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Email Content Sandboxing</h2>
          <p>
            Incoming emails are sanitized before rendering. JavaScript execution is stripped, tracking pixels are blocked, and external URLs are set to no-referrer, protecting you from malicious senders and tracking systems.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Infrastructure &amp; Security</h2>
          <p>
            Our edge email ingestion runs on Cloudflare Email Routing with TLS 1.3 encryption in transit. Database storage is protected by PostgreSQL Row Level Security (RLS) policies.
          </p>
        </section>
      </div>
    </div>
  );
}
