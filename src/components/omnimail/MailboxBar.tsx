'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  ChevronDown,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { formatTimeRemaining } from '@/lib/utils';
import { QrCodeModal } from './QrCodeModal';
import { DomainItem } from '@/types/email';

interface MailboxBarProps {
  address: string;
  expiresAt: string;
  domains: DomainItem[];
  currentDomain: string;
  mailboxCount: number;
  isLoading: boolean;
  onRefreshEmail: () => void;
  onGenerateRandom: () => void;
  onCustomAddress: (customLocalPart: string, domain: string) => void;
  onSelectDomain: (domain: string) => void;
  onExtendTimer: () => void;
  onDeleteMailbox: () => void;
  onOpenMultiDrawer: () => void;
}

export const MailboxBar: React.FC<MailboxBarProps> = ({
  address,
  expiresAt,
  domains,
  currentDomain,
  mailboxCount,
  isLoading,
  onRefreshEmail,
  onGenerateRandom,
  onCustomAddress,
  onSelectDomain,
  onExtendTimer,
  onDeleteMailbox,
  onOpenMultiDrawer,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customPrefix, setCustomPrefix] = useState('');
  const [timeLeft, setTimeLeft] = useState('60:00');
  const [percentRemaining, setPercentRemaining] = useState(100);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const { success } = useToast();

  // Trigger animation when address changes
  useEffect(() => {
    if (address) {
      setJustGenerated(true);
      const timer = setTimeout(() => setJustGenerated(false), 800);
      return () => clearTimeout(timer);
    }
  }, [address]);

  // Tick timer and compute circular progress
  useEffect(() => {
    if (!expiresAt) return;
    const updateTime = () => {
      const remaining = formatTimeRemaining(expiresAt);
      setTimeLeft(remaining.formatted);
      setIsExpiringSoon(remaining.minutes < 10 && !remaining.isExpired);

      // Assume 60 minutes base cycle (3600 seconds)
      const totalSeconds = remaining.minutes * 60 + remaining.seconds;
      const pct = Math.max(0, Math.min(100, (totalSeconds / 3600) * 100));
      setPercentRemaining(pct);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    success('Temporary email address copied!');
    setTimeout(() => setCopied(false), 1800);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrefix.trim()) return;
    onCustomAddress(customPrefix.trim(), currentDomain);
    setEditMode(false);
    setCustomPrefix('');
  };

  // SVG Circular progress constants
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentRemaining / 100) * circumference;

  return (
    <>
      <div className="w-full rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 transition-all duration-200">
        {/* Glow ambient background in dark mode */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-32 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top meta strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Temporary Mailbox
            </span>

            {/* Multi-mailbox switcher button */}
            <button
              onClick={onOpenMultiDrawer}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200 dark:border-slate-750"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Addresses ({mailboxCount})</span>
            </button>
          </div>

          {/* Expiration countdown with Animated Circular Progress Ring */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-colors border ${
                isExpiringSoon
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/40'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/60'
              }`}
            >
              {/* Circular SVG Progress Ring */}
              <svg className="w-5 h-5 -rotate-90 transform shrink-0" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className="stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className={`countdown-ring-circle ${
                    isExpiringSoon
                      ? 'stroke-rose-500'
                      : percentRemaining < 40
                      ? 'stroke-amber-500'
                      : 'stroke-sky-500'
                  }`}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span>{timeLeft}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onExtendTimer}
              className="h-8 text-xs px-2.5 text-indigo-600 dark:text-sky-400 hover:text-indigo-700 dark:hover:text-sky-300 border-indigo-200 dark:border-sky-500/30 hover:bg-indigo-50 dark:hover:bg-sky-500/10"
              title="Add 60 minutes to mailbox"
            >
              <PlusCircle className="w-3.5 h-3.5" /> +60m
            </Button>
          </div>
        </div>

        {/* Main Address Display / Input Box */}
        {editMode ? (
          <form onSubmit={handleApplyCustom} className="flex flex-col sm:flex-row gap-2 mb-4 animate-in fade-in duration-200">
            <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 border border-indigo-500 dark:border-sky-500 rounded-xl px-3.5 py-2.5 shadow-inner">
              <input
                type="text"
                autoFocus
                placeholder="custom.username"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                className="bg-transparent text-sm sm:text-base font-mono text-slate-900 dark:text-white focus:outline-none w-full"
              />
              <span className="text-slate-500 font-mono text-sm px-1">@{currentDomain}</span>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md">
                Save Address
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
            {/* Click to Copy Box with Animations */}
            <div
              onClick={handleCopy}
              className={`flex-1 group cursor-pointer border rounded-2xl px-4 py-3.5 transition-all flex items-center justify-between gap-3 shadow-xs ${
                justGenerated
                  ? 'animate-email-generated border-indigo-500/60 dark:border-sky-500/60'
                  : 'bg-slate-50/80 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  {isLoading ? (
                    <div className="h-6 w-48 animate-skeleton rounded-md" />
                  ) : (
                    <span className="text-base sm:text-xl font-mono font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-sky-300 transition-colors truncate block">
                      {address || 'Generating address...'}
                    </span>
                  )}
                </div>
              </div>

              {/* Copy CTA Button with Pop Animation */}
              <div
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  copied
                    ? 'bg-emerald-500 text-white animate-copy-pop'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Domain Dropdown */}
              <div className="relative">
                <select
                  value={currentDomain}
                  onChange={(e) => onSelectDomain(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 pr-7 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer h-10 shadow-xs"
                >
                  {domains.map((d) => (
                    <option key={d.domainName} value={d.domainName}>
                      @{d.domainName} {d.domainName === 'mail.omnibey.com' ? '⚡' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Generate Random */}
              <Button
                variant="secondary"
                size="md"
                onClick={onGenerateRandom}
                isLoading={isLoading}
                title="Generate new random address"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Randomize</span>
              </Button>

              {/* Edit / Custom Username */}
              <Button
                variant="outline"
                size="md"
                onClick={() => setEditMode(true)}
                title="Choose custom username"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Customize</span>
              </Button>

              {/* QR Code */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQrOpen(true)}
                title="Scan QR on mobile phone"
              >
                <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </Button>

              {/* Delete Mailbox */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeleteMailbox}
                title="Delete this temporary mailbox"
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <QrCodeModal isOpen={qrOpen} onClose={() => setQrOpen(false)} address={address} />
    </>
  );
};
