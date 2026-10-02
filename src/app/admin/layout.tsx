'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Mail,
  MessageSquare,
  CreditCard,
  Coins,
  BarChart3,
  Sliders,
  FileText,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const adminNavItems = [
  { label: 'Admin Overview', href: '/admin', icon: ShieldAlert },
  { label: 'User Directory', href: '/admin/users', icon: Users },
  { label: 'Payment Verifications', href: '/admin/payments', icon: CreditCard },
  { label: 'Active Temp Emails', href: '/admin/emails', icon: Mail },
  { label: 'Inbound Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Credit Packages', href: '/admin/credits', icon: Coins },
  { label: 'Analytics & KPIs', href: '/admin/analytics', icon: BarChart3 },
  { label: 'System Settings', href: '/admin/settings', icon: Sliders },
  { label: 'Security Audit Logs', href: '/admin/audit-logs', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950/80 transition-colors">
      {/* Mobile Top Subbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-rose-500/20 bg-rose-500/5">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          Admin Navigation Menu
        </button>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold uppercase border border-rose-500/20">
          Super Admin
        </span>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex-shrink-0 p-4 space-y-6 transition-colors`}
      >
        {/* Admin Badge Header */}
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            Admin Console
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Privileged administrative control with transactional idempotency &amp; audit logging.
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white font-semibold shadow-xs shadow-rose-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </span>
                {item.href === '/admin/payments' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                    Review
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to User Dashboard */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to User Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
