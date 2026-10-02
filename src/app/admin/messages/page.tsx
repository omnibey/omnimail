'use client';

import React, { useState } from 'react';
import { MessageSquare, Zap, Search, ShieldCheck, Mail, Clock } from 'lucide-react';

export default function AdminMessagesPage() {
  const [messages] = useState([
    {
      id: 'msg-1',
      recipient: 'quickbox47@mail.omnibey.com',
      sender: 'noreply@discord.com',
      subject: 'Your Discord Security Verification Code',
      otp: '849201',
      sanitized: true,
      time: '5m ago',
    },
    {
      id: 'msg-2',
      recipient: 'discord.flow84@mail.omnibey.com',
      sender: 'auth@openai.com',
      subject: 'OpenAI platform authentication token',
      otp: '719234',
      sanitized: true,
      time: '25m ago',
    },
    {
      id: 'msg-3',
      recipient: 'playwright.ci99@mail.omnibey.com',
      sender: 'notifications@github.com',
      subject: '[GitHub] Please verify your device',
      otp: '492810',
      sanitized: true,
      time: '1h ago',
    },
  ]);

  const [search, setSearch] = useState('');

  const filtered = messages.filter(
    (m) =>
      m.recipient.toLowerCase().includes(search.toLowerCase()) ||
      m.sender.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-page-fade">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Inbound Edge Message Stream
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time payload inspection showing sanitized HTML bodies and detected 4-8 digit OTP tokens.
          </p>
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sender, recipient..."
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
                <th className="py-3 px-4">Recipient Inbox</th>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Detected OTP</th>
                <th className="py-3 px-4 text-center">Sanitization</th>
                <th className="py-3 px-4 text-right">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {msg.recipient}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                    {msg.sender}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {msg.subject}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {msg.otp ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold font-mono">
                        <Zap className="w-3 h-3" />
                        {msg.otp}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Cleaned
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                    {msg.time}
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
