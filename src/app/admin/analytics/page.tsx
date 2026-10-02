'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, Mail, Zap, DollarSign, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const metrics = [
    { label: 'Weekly Active Users (WAU)', value: '184', trend: '+14.2% vs last week' },
    { label: 'Emails Ingested (7d)', value: '4,892', trend: '+28.4% edge traffic' },
    { label: 'OTP Detection Rate', value: '38.6%', trend: '99.4% heuristic precision' },
    { label: 'Average Edge Delivery Latency', value: '112ms', trend: 'Cloudflare Worker' },
  ];

  return (
    <div className="space-y-6 animate-page-fade">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Analytics &amp; Telemetry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          High-performance analytics aggregating ingestion volume, verification rates, and platform usage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
          >
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{m.label}</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{m.value}</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              {m.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Traffic & Ingestion Visualization Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" /> Hourly Email Ingestion Throughput
        </h3>

        <div className="h-48 flex items-end justify-between gap-2 pt-8 px-2 border-b border-slate-200 dark:border-slate-800">
          {[35, 45, 60, 20, 85, 95, 110, 75, 90, 130, 150, 120].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                style={{ height: `${(h / 150) * 100}%` }}
                className="w-full bg-gradient-to-t from-indigo-600 to-sky-400 rounded-t-md opacity-85 hover:opacity-100 transition-opacity"
                title={`${h} emails/hr`}
              />
              <span className="text-[10px] text-slate-400 font-mono">{i * 2}:00</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
