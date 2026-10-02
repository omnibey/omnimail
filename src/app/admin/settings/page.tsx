'use client';

import React, { useState } from 'react';
import { Sliders, Send, ShieldCheck, Server, Bell, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { TelegramService } from '@/lib/services/TelegramService';

export default function AdminSettingsPage() {
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [cloudflareEnabled, setCloudflareEnabled] = useState(true);
  const [defaultTTL, setDefaultTTL] = useState('60');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { success, error, info } = useToast();

  const handleTestTelegram = async () => {
    setTelegramStatus('testing');
    try {
      const ok = await TelegramService.notifySystemAlert({
        title: 'Admin Verification Test',
        severity: 'info',
        details: 'Testing connection from OmniBey Admin Console. If you receive this, the Telegram bot is online and functioning properly.',
      });

      if (ok) {
        setTelegramStatus('success');
        success('Test message sent to Telegram admin channel!');
      } else {
        setTelegramStatus('failed');
        info('Telegram credentials not configured in environment. Check TELEGRAM_BOT_TOKEN.');
      }
    } catch {
      setTelegramStatus('failed');
      error('Failed to dispatch test notification.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Administrative settings updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl animate-page-fade">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Administration &amp; Integrations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure edge providers, telegram webhook notifications, and global mailbox retention policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Telegram Integration Panel (Section 17) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" /> Telegram Bot Admin Notifications
          </h3>

          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            OmniBey automatically dispatches instant alerts for newly submitted manual payments (Binance, bKash, etc.) directly to your private administrative Telegram chat.
          </p>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTestTelegram}
              isLoading={telegramStatus === 'testing'}
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Test Telegram Alert
            </Button>
            {telegramStatus === 'success' && (
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            )}
          </div>
        </div>

        {/* Global Retention & TTL (Section 28) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-500" /> Mailbox Retention &amp; Auto-Purge
          </h3>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Default Mailbox Lifespan (Minutes)
            </label>
            <select
              value={defaultTTL}
              onChange={(e) => setDefaultTTL(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes (Standard Default)</option>
              <option value="120">120 Minutes</option>
            </select>
          </div>

          <label className="flex items-center justify-between cursor-pointer pt-2">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Cloudflare Ingestion Edge Route
              </span>
              <span className="text-slate-400">
                Route mail.omnibey.com incoming webhooks to active worker parser.
              </span>
            </div>
            <input
              type="checkbox"
              checked={cloudflareEnabled}
              onChange={(e) => setCloudflareEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="glow" size="md">
            <Save className="w-3.5 h-3.5" /> Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
