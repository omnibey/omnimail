'use client';

import React, { useState } from 'react';
import { Mail, Clock, Search, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function AdminEmailsMonitorPage() {
  const [emails, setEmails] = useState([
    {
      id: 'emb-1',
      address: 'quickbox47@mail.omnibey.com',
      user: 'developer@omnibey.com',
      created: '15m ago',
      expiresIn: '45m',
      messages: 3,
      status: 'active',
    },
    {
      id: 'emb-2',
      address: 'discord.flow84@mail.omnibey.com',
      user: 'sarah.qa@techscale.io',
      created: '1h ago',
      expiresIn: '1h 10m',
      messages: 5,
      status: 'active',
    },
    {
      id: 'emb-3',
      address: 'playwright.ci99@mail.omnibey.com',
      user: 'Anonymous Guest',
      created: '3h ago',
      expiresIn: '0m',
      messages: 12,
      status: 'expired',
    },
  ]);

  const [search, setSearch] = useState('');
  const { success } = useToast();

  const handlePurge = (id: string) => {
    setEmails(emails.filter((e) => e.id !== id));
    success('Temporary inbox manually purged.');
  };

  const filtered = emails.filter((e) =>
    e.address.toLowerCase().includes(search.toLowerCase()) ||
    e.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-page-fade">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Active Temporary Inboxes Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global monitoring of dynamically generated addresses across mail.omnibey.com and omnibey.com.
          </p>
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search address or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mailbox Address</th>
                <th className="py-3 px-4">Owner / Session</th>
                <th className="py-3 px-4 text-center">Messages</th>
                <th className="py-3 px-4">TTL Remaining</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {item.address}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {item.user}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                    {item.messages}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {item.expiresIn}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handlePurge(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      title="Purge Mailbox"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
