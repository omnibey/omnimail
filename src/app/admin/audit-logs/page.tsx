'use client';

import React, { useState } from 'react';
import { FileText, Shield, Search, Clock, Filter, Key } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  metadata: string;
}

export default function AdminAuditLogsPage() {
  const [logs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      adminEmail: 'alex.mercer@omnibey.com',
      action: 'payment_approved',
      targetType: 'payment',
      targetId: 'PAY-10291',
      timestamp: '10 minutes ago',
      metadata: 'Credits added: +275, Proof screenshot purged from Supabase Storage.',
    },
    {
      id: 'log-2',
      adminEmail: 'alex.mercer@omnibey.com',
      action: 'credit_adjustment',
      targetType: 'user',
      targetId: 'usr-2 (sarah.qa@techscale.io)',
      timestamp: '1 hour ago',
      metadata: 'Adjusted: +100 credits. Reason: QA partnership bonus.',
    },
    {
      id: 'log-3',
      adminEmail: 'alex.mercer@omnibey.com',
      action: 'payment_rejected',
      targetType: 'payment',
      targetId: 'PAY-10289',
      timestamp: '3 hours ago',
      metadata: 'Reason: Sender number mismatch with payment gateway.',
    },
    {
      id: 'log-4',
      adminEmail: 'alex.mercer@omnibey.com',
      action: 'user_suspended',
      targetType: 'user',
      targetId: 'usr-3 (tester99@domain.org)',
      timestamp: 'Yesterday',
      metadata: 'Abuse threshold exceeded: excessive rapid automated disposable requests.',
    },
  ]);

  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.targetId.toLowerCase().includes(search.toLowerCase()) ||
      l.adminEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-page-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Security &amp; Administrative Audit Logs
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              Immutable Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 23 compliant tracking of all admin approvals, rejections, user suspensions, and adjustments.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Details &amp; Metadata</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold uppercase text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {log.adminEmail}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {log.targetId}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {log.metadata}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                    {log.timestamp}
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
