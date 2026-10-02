'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Mail,
  History,
  Coins,
  CreditCard,
  User,
  Settings,
  Key,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Live Inbox', href: '/dashboard/inbox', icon: Inbox },
  { label: 'My Emails', href: '/dashboard/emails', icon: Mail },
  { label: 'Usage History', href: '/dashboard/history', icon: History },
  { label: 'Credits & Store', href: '/dashboard/credits', icon: Coins },
  { label: 'Payment Orders', href: '/dashboard/payments', icon: CreditCard },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { label: 'My Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('admin');
  const [userCredits, setUserCredits] = useState<number>(250);
  const [userEmail, setUserEmail] = useState<string>('developer@omnibey.com');
  const { info } = useToast();

  useEffect(() => {
    async function loadUser() {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || 'developer@omnibey.com');
          const role = user.user_metadata?.role || (user.app_metadata?.role as string) || 'user';
          setUserRole(role === 'admin' ? 'admin' : 'user');
        }
      } else {
        // Read dev cookie if any
        const match = document.cookie.match(/omnibey_dev_role=([^;]+)/);
        if (match && match[1] === 'admin') {
          setUserRole('admin');
        }
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    document.cookie = 'omnibey_dev_session=; path=/; max-age=0';
    document.cookie = 'omnibey_dev_role=; path=/; max-age=0';
    info('Logged out successfully.');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950/60 transition-colors">
      {/* Mobile Top Subbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {mobileNavOpen ? <X className="w-5 h-5 text-indigo-500" /> : <Menu className="w-5 h-5 text-indigo-500" />}
          Dashboard Navigation
        </button>
        <Link
          href="/dashboard/credits"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold"
        >
          <Coins className="w-3.5 h-3.5" />
          {userCredits} Credits
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 flex-shrink-0 p-4 space-y-6 transition-colors`}
      >
        {/* User Mini Card */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              {userEmail}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Free Tier
            </span>
          </div>
          <Link
            href="/dashboard/credits"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold shrink-0 hover:bg-amber-500/20 transition-colors"
            title="Purchase or view credits"
          >
            <Coins className="w-3 h-3" />
            {userCredits}
          </Link>
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </span>
                {item.label === 'Live Inbox' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 font-bold">
                    Edge
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Link (Section 3 & 20) */}
        {userRole === 'admin' && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
              Administrative
            </span>
            <Link
              href="/admin"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Admin Console
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            </Link>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors w-full text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
