'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Mail,
  Key,
  ShieldCheck,
  Coins,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Sparkles,
  Zap,
  Clock,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { generateRandomAddress } from '@/lib/email/generator';

export default function DashboardOverviewPage() {
  const [currentEmail, setCurrentEmail] = useState('quickbox47@mail.omnibey.com');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(58 * 60); // 58 minutes
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { success, info } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentEmail);
    setCopied(true);
    success('Email copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    setIsRefreshing(true);
    const newAddress = generateRandomAddress('mail.omnibey.com');
    setTimeout(() => {
      setCurrentEmail(newAddress);
      setTimeLeft(60 * 60);
      setIsRefreshing(false);
      success(`Generated new inbox: ${newAddress}`);
    }, 250);
  };

  const handleExtend = () => {
    setTimeLeft((prev) => prev + 3600);
    success('Extended mailbox lifespan by +60 minutes');
  };

  const stats = [
    { label: 'Active Inboxes', value: '3', change: '+1 today', href: '/dashboard/emails', icon: Mail, color: 'text-indigo-500' },
    { label: 'Received Messages', value: '28', change: '4 today', href: '/dashboard/inbox', icon: Inbox, color: 'text-sky-500' },
    { label: 'Auto-Detected OTPs', value: '14', change: '100% accuracy', href: '/dashboard/inbox', icon: Zap, color: 'text-amber-500' },
    { label: 'Credits Available', value: '250', change: 'Starter pack', href: '/dashboard/credits', icon: Coins, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-page-fade">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back to OmniMail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dynamic temporary mailboxes, instant OTP detection, and clean Cloudflare edge delivery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/inbox">
            <Button variant="glow" size="sm">
              <Inbox className="w-3.5 h-3.5" /> View Live Inbox
            </Button>
          </Link>
          <Link href="/dashboard/payments">
            <Button variant="secondary" size="sm">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> Add Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Mailbox Card (Section 6 Requirement) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-sky-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Current Temporary Email Address
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight select-all">
              {currentEmail}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Incoming mail forwarded instantly via Cloudflare Edge Worker with zero persistent logs.
            </p>
          </div>

          {/* Action Buttons & Countdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <Clock className="w-4 h-4 text-indigo-500" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-none">Expires In</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {formatCountdown(timeLeft)}
                </span>
              </div>
              <button
                onClick={handleExtend}
                className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 font-bold"
                title="Add 60 minutes"
              >
                +60m
              </button>
            </div>

            <Button
              variant="glow"
              size="md"
              onClick={handleCopy}
              className={copied ? 'bg-emerald-600 text-white' : ''}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleGenerate}
              isLoading={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Generate New
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{stat.change}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-500 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Activity & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Mailbox Activity</h3>
            <Link href="/dashboard/history" className="text-xs text-indigo-600 dark:text-sky-400 hover:underline font-semibold">
              View History
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                service: 'Discord Registration',
                email: 'discord.flow84@mail.omnibey.com',
                otp: '849201',
                time: '12 minutes ago',
              },
              {
                service: 'GitHub QA Automation',
                email: 'qa.test92@mail.omnibey.com',
                otp: '492810',
                time: '45 minutes ago',
              },
              {
                service: 'OpenAI Test Account',
                email: 'verifybox82@mail.omnibey.com',
                otp: '719234',
                time: '2 hours ago',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850"
              >
                <div className="truncate pr-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {item.service}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                      OTP: {item.otp}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {item.email}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 whitespace-nowrap">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            <Link
              href="/dashboard/inbox"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-sky-500" /> Check Inbound Mail
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/payments"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" /> Manual Payment (bKash/Binance)
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/history"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" /> Email History
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
