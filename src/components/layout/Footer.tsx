import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Globe, Lock, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                OB
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">OmniBey</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              OmniMail &mdash; Disposable temporary email on <strong className="text-slate-700 dark:text-slate-300">mail.omnibey.com</strong>. High speed, zero spam, zero tracking, powered by Cloudflare and Supabase.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 1.3 &bull; SPF &amp; DKIM Verified</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  OmniMail Temporary Inbox
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Pro Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Multi-Mailbox Manager
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Developer REST API
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Tech */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">Infrastructure</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span>Cloudflare Email Edge</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>Supabase PostgreSQL + RLS</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Auto-Purge &amp; Expiry</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>Pluggable Gmail/Outlook API</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">Security &amp; Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Privacy Policy (Zero Logs)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="/api/health" target="_blank" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  System Health &amp; Diagnostics
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} OmniBey (<a href="https://omnibey.com" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white">omnibey.com</a>). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for high scalability &amp; modular SaaS workflows.
          </p>
        </div>
      </div>
    </footer>
  );
};
