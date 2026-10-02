'use client';

import React, { useState, useEffect } from 'react';
import { History, Shield, Zap, Search, Clock, Tag, ExternalLink } from 'lucide-react';
import { EmailService } from '@/lib/services/EmailService';

export default function DashboardHistoryPage() {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await EmailService.getUserHistory('dev-user-123');
        setHistoryItems(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = historyItems.filter((item) => {
    const term = search.toLowerCase();
    const service = (item.user_reported_service || '').toLowerCase();
    const domain = (item.observed_sender_domain || '').toLowerCase();
    const address = (item.email_addresses?.email_address || '').toLowerCase();
    return service.includes(term) || domain.includes(term) || address.includes(term);
  });

  return (
    <div className="space-y-6 animate-page-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Email Usage History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit history tracking observed sender domains vs user-reported testing sessions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search service, domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Transparency Note (Section 10 Requirement) */}
      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        <div>
          <strong>Privacy Integrity:</strong> OmniMail strictly separates <em>User-Reported Labels</em> from <em>Observed Sender Domains</em>. We never speculate or claim unwarranted certainty about third-party registrations.
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Temporary Mailbox</th>
                <th className="py-3 px-4">User Reported Tag</th>
                <th className="py-3 px-4">Observed Sender</th>
                <th className="py-3 px-4 text-center">Messages</th>
                <th className="py-3 px-4 text-center">OTPs</th>
                <th className="py-3 px-4 text-right">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {item.email_addresses?.email_address || 'quickbox@mail.omnibey.com'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium">
                      <Tag className="w-3 h-3" />
                      {item.user_reported_service || 'General Testing'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                    {item.observed_sender_domain ? (
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">
                        @{item.observed_sender_domain}
                      </span>
                    ) : (
                      'None observed'
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                    {item.message_count}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      <Zap className="w-3 h-3" />
                      {item.otp_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {new Date(item.last_activity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No usage history matches your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
