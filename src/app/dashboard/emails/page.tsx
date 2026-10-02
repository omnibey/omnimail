'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Plus,
  Copy,
  Check,
  Trash2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { generateRandomAddress } from '@/lib/email/generator';

interface EmailItem {
  id: string;
  address: string;
  createdAt: string;
  expiresInMinutes: number;
  messageCount: number;
  status: 'active' | 'expired';
}

export default function DashboardEmailsPage() {
  const [emails, setEmails] = useState<EmailItem[]>([
    {
      id: 'mbx-1',
      address: 'quickbox47@mail.omnibey.com',
      createdAt: '12 minutes ago',
      expiresInMinutes: 48,
      messageCount: 3,
      status: 'active',
    },
    {
      id: 'mbx-2',
      address: 'discord.flow84@mail.omnibey.com',
      createdAt: '1 hour ago',
      expiresInMinutes: 110,
      messageCount: 5,
      status: 'active',
    },
    {
      id: 'mbx-3',
      address: 'tester.stream19@mail.omnibey.com',
      createdAt: 'Yesterday',
      expiresInMinutes: 0,
      messageCount: 1,
      status: 'expired',
    },
  ]);

  const [customPrefix, setCustomPrefix] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { success, error } = useToast();

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    success(`Copied ${address} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = customPrefix.trim() || undefined;
    const newAddress = prefix
      ? `${prefix.toLowerCase().replace(/[^a-z0-9.]/g, '')}@mail.omnibey.com`
      : generateRandomAddress('mail.omnibey.com');

    const newItem: EmailItem = {
      id: `mbx-${Date.now()}`,
      address: newAddress,
      createdAt: 'Just now',
      expiresInMinutes: 60,
      messageCount: 0,
      status: 'active',
    };

    setEmails([newItem, ...emails]);
    setCustomPrefix('');
    success(`Created active temporary email: ${newAddress}`);
  };

  const handleDelete = (id: string) => {
    setEmails(emails.filter((e) => e.id !== id));
    success('Temporary mailbox removed.');
  };

  const handleExtend = (id: string) => {
    setEmails(
      emails.map((e) =>
        e.id === id ? { ...e, expiresInMinutes: e.expiresInMinutes + 60, status: 'active' } : e
      )
    );
    success('Extended lifespan by +60 minutes');
  };

  return (
    <div className="space-y-6 animate-page-fade">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Temporary Mailboxes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic recipient routing on mail.omnibey.com. Generate multiple mailboxes concurrently.
          </p>
        </div>
      </div>

      {/* Creation Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleCreateNew} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Custom prefix (e.g. testing.alex) or leave empty for random"
              value={customPrefix}
              onChange={(e) => setCustomPrefix(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button type="submit" variant="glow" size="md" className="w-full sm:w-auto shrink-0">
            <Plus className="w-4 h-4" /> Generate Mailbox
          </Button>
        </form>
      </div>

      {/* Emails List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emails.map((email) => {
          const isCopied = copiedId === email.id;
          const isExpired = email.status === 'expired' || email.expiresInMinutes <= 0;

          return (
            <div
              key={email.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isExpired
                  ? 'border-slate-200 dark:border-slate-850 opacity-60'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isExpired
                        ? 'bg-slate-500/10 text-slate-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isExpired ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'
                      }`}
                    />
                    {isExpired ? 'Expired' : 'Active'}
                  </span>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isExpired ? 'TTL 0m' : `${email.expiresInMinutes}m left`}
                  </span>
                </div>

                <div className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate mb-2 select-all">
                  {email.address}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between py-1">
                  <span>Messages received:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{email.messageCount}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Created:</span>
                  <span>{email.createdAt}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(email.address, email.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    title="Copy Address"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleExtend(email.id)}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-500/50 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="Extend expiration"
                  >
                    +60m
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(email.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete Mailbox"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
