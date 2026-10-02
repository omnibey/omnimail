'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Globe,
  Sliders,
  Key,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function DashboardSettingsPage() {
  const [defaultDomain, setDefaultDomain] = useState('mail.omnibey.com');
  const [autoRefreshSec, setAutoRefreshSec] = useState('10');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoCopyOtp, setAutoCopyOtp] = useState(false);
  const { success } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Dashboard preferences saved!');
  };

  return (
    <div className="space-y-8 max-w-4xl animate-page-fade">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Preferences &amp; Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize your mailbox generation defaults, notification sounds, and appearance.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Appearance Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" /> Interface Appearance
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Theme Mode
              </span>
              <span className="text-slate-400">
                Toggle between light and dark visual aesthetics.
              </span>
            </div>
            <ThemeToggle showLabel />
          </div>
        </div>

        {/* Mailbox Defaults */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" /> Mailbox Defaults
          </h3>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Primary Ingestion Domain
            </label>
            <select
              value={defaultDomain}
              onChange={(e) => setDefaultDomain(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="mail.omnibey.com">mail.omnibey.com (Recommended - Edge Route)</option>
              <option value="omnibey.com">omnibey.com (Main Apex Domain)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Auto-Refresh Polling Interval
            </label>
            <select
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="5">5 seconds (High Frequency)</option>
              <option value="10">10 seconds (Standard)</option>
              <option value="30">30 seconds (Low Bandwidth)</option>
            </select>
          </div>
        </div>

        {/* Notifications & OTP */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" /> Notifications &amp; Automation
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Audio chime on new email
                </span>
                <span className="text-slate-400">
                  Plays a subtle acoustic chime whenever a new message reaches your temporary mailbox.
                </span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Auto-copy detected OTP to clipboard
                </span>
                <span className="text-slate-400">
                  Immediately copies newly detected 4-8 digit verification tokens to your clipboard.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoCopyOtp}
                onChange={(e) => setAutoCopyOtp(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="glow" size="md">
            <Save className="w-3.5 h-3.5" /> Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
