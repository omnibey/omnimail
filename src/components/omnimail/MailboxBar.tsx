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
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const { success } = useToast();

  // Tick timer
  useEffect(() => {
    if (!expiresAt) return;
    const updateTime = () => {
      const remaining = formatTimeRemaining(expiresAt);
      setTimeLeft(remaining.formatted);
      setIsExpiringSoon(remaining.minutes < 10 && !remaining.isExpired);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    success('Address copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrefix.trim()) return;
    onCustomAddress(customPrefix.trim(), currentDomain);
    setEditMode(false);
    setCustomPrefix('');
  };

  return (
    <>
      <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden border border-slate-800">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top meta strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Temporary Mailbox
            </span>

            {/* Multi-mailbox switcher button */}
            <button
              onClick={onOpenMultiDrawer}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mailboxes ({mailboxCount})</span>
            </button>
          </div>

          {/* Expiration countdown & extend */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold ${
                isExpiringSoon
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeLeft}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onExtendTimer}
              className="h-7 text-xs px-2.5 text-sky-400 hover:text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
              title="Add 60 minutes to mailbox"
            >
              <PlusCircle className="w-3.5 h-3.5" /> +60m
            </Button>
          </div>
        </div>

        {/* Main Address Display / Input Box */}
        {editMode ? (
          <form onSubmit={handleApplyCustom} className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1 flex items-center bg-slate-950/90 border border-sky-500/60 rounded-xl px-3 py-2 shadow-inner">
              <input
                type="text"
                autoFocus
                placeholder="custom.username"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                className="bg-transparent text-sm sm:text-base font-mono text-white focus:outline-none w-full"
              />
              <span className="text-slate-500 font-mono text-sm px-1">@{currentDomain}</span>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm">
                Save Address
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            {/* Click to Copy Box */}
            <div
              onClick={handleCopy}
              className="flex-1 group cursor-pointer bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 transition-all flex items-center justify-between gap-3 shadow-inner"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-base sm:text-xl font-mono font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors truncate block">
                    {address || 'Generating address...'}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 group-hover:bg-indigo-600 text-xs font-medium text-slate-300 group-hover:text-white transition-all shadow-sm">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                  className="appearance-none bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 pr-7 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer h-10"
                >
                  {domains.map((d) => (
                    <option key={d.domainName} value={d.domainName}>
                      @{d.domainName} {d.isPremium ? '★' : ''}
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
                title="Scan QR on mobile"
              >
                <QrCode className="w-4 h-4 text-slate-300" />
              </Button>

              {/* Delete Mailbox */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeleteMailbox}
                title="Delete this temporary mailbox"
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
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
