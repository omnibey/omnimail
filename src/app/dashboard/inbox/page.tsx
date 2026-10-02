'use client';

import React, { useState } from 'react';
import { InboxView } from '@/components/omnimail/InboxView';
import { SendTestEmailModal } from '@/components/omnimail/SendTestEmailModal';
import { Button } from '@/components/ui/Button';
import { Send, Shield, Zap, Sparkles } from 'lucide-react';

export default function DashboardInboxPage() {
  const [testModalOpen, setTestModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-page-fade">
      {/* Inbox Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Edge Inbox
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              Cloudflare Ingestion
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time delivery with heuristic OTP code auto-detection and HTML body sandboxing.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          onClick={() => setTestModalOpen(true)}
        >
          <Send className="w-3.5 h-3.5" /> Send Test Email
        </Button>
      </div>

      {/* Main Inbox View Component */}
      <div className="rounded-2xl">
        <InboxView />
      </div>

      <SendTestEmailModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        address="quickbox47@mail.omnibey.com"
      />
    </div>
  );
}
