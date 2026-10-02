'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, GitPullRequest, Receipt, Edit3, Send, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface SendTestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onEmailSent?: () => void;
}

export const SendTestEmailModal: React.FC<SendTestEmailModalProps> = ({
  isOpen,
  onClose,
  address,
  onEmailSent,
}) => {
  const [template, setTemplate] = useState<'verification' | 'github' | 'receipt' | 'custom'>('verification');
  const [customSubject, setCustomSubject] = useState('');
  const [customSender, setCustomSender] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSend = async () => {
    if (!address) return;
    setLoading(true);

    try {
      const res = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: address,
          template,
          customSubject: customSubject || undefined,
          customSender: customSender || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Test email simulated & received in your inbox!');
        onClose();
        if (onEmailSent) {
          setTimeout(onEmailSent, 500);
        }
      } else {
        error(data.error || 'Failed to send test email');
      }
    } catch (err: unknown) {
      error('Error communicating with test sender');
    } finally {
      setLoading(false);
    }
  };

  const templates: Array<{
    id: 'verification' | 'github' | 'receipt' | 'custom';
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    {
      id: 'verification',
      title: '2FA Verification Code',
      desc: 'One-time security OTP from OmniBey Auth',
      icon: ShieldCheck,
      color: 'text-sky-400',
    },
    {
      id: 'github',
      title: 'GitHub PR Notification',
      desc: 'Pull Request merged & CI build status update',
      icon: GitPullRequest,
      color: 'text-purple-400',
    },
    {
      id: 'receipt',
      title: 'Stripe SaaS Receipt',
      desc: 'Monthly subscription billing confirmation',
      icon: Receipt,
      color: 'text-emerald-400',
    },
    {
      id: 'custom',
      title: 'Custom Test Message',
      desc: 'Specify your own sender and subject',
      icon: Edit3,
      color: 'text-amber-400',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulate Inbound Email"
      description="Send a realistic email to test your temporary mailbox instantly"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="text-xs text-slate-400">
          Sending to: <span className="font-mono text-white font-medium">{address}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {templates.map((t) => {
            const isSelected = template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-sky-500/80 shadow-md shadow-sky-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-slate-800 ${t.color}`}>
                    <t.icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{t.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {template === 'custom' && (
          <div className="space-y-2.5 pt-2 border-t border-slate-800 animate-in fade-in">
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Sender Name / Email</label>
              <input
                type="text"
                placeholder="CEO <alex@enterprise.com>"
                value={customSender}
                onChange={(e) => setCustomSender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Subject Line</label>
              <input
                type="text"
                placeholder="Urgent: Partnership Opportunity"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSend} isLoading={loading}>
            <Send className="w-3.5 h-3.5" /> Dispatch Test Email
          </Button>
        </div>
      </div>
    </Modal>
  );
};
