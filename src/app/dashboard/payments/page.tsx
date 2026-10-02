'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PaymentService, PaymentMethod } from '@/lib/services/PaymentService';

interface PaymentItem {
  id: string;
  payment_reference: string;
  amount: number;
  currency: string;
  payment_method: string;
  sender_identifier: string;
  transaction_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
}

const paymentDestinations: Record<
  PaymentMethod,
  { name: string; target: string; instructions: string; currency: string }
> = {
  bkash: {
    name: 'bKash Personal / Merchant',
    target: '01712-345678',
    instructions: 'Send money to this personal bKash number. Use your OmniBey account email as reference.',
    currency: 'BDT (৳)',
  },
  nagad: {
    name: 'Nagad Personal',
    target: '01812-345678',
    instructions: 'Send money to this personal Nagad number. Keep the TrxID or take a screenshot.',
    currency: 'BDT (৳)',
  },
  rocket: {
    name: 'Rocket (DBBL)',
    target: '01912-345678-9',
    instructions: 'Use Rocket Send Money to the account specified above.',
    currency: 'BDT (৳)',
  },
  upay: {
    name: 'Upay Personal',
    target: '01612-345678',
    instructions: 'Send money to this personal Upay account.',
    currency: 'BDT (৳)',
  },
  binance: {
    name: 'Binance Pay / USDT (TRC20 / BEP20)',
    target: 'TXN84910294827182938472918293',
    instructions: 'Binance Pay ID: 84910294 or send USDT (TRC20) to the address above.',
    currency: 'USD ($)',
  },
};

function PaymentsContent() {
  const searchParams = useSearchParams();
  const preselectedPkg = searchParams.get('package') || '';
  const preselectedAmount = searchParams.get('amount') || '5.00';

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);

  // Form State
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [amount, setAmount] = useState(preselectedAmount);
  const [senderId, setSenderId] = useState('');
  const [txnId, setTxnId] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error, info } = useToast();

  useEffect(() => {
    async function loadPayments() {
      const data = await PaymentService.getUserPayments('dev-user-123');
      setPayments(data);
    }
    loadPayments();
  }, []);

  const handleCopyTarget = () => {
    navigator.clipboard.writeText(paymentDestinations[method].target);
    setCopiedTarget(true);
    success('Copied payment destination to clipboard');
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        error('Screenshot must be smaller than 5MB.');
        return;
      }
      setScreenshotName(file.name);
      success(`Attached: ${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Section 14 Validation Rule
    if (!senderId.trim()) {
      error('Sender Number / Account Identifier is required.');
      return;
    }

    if (!txnId.trim() && !screenshotName) {
      error('At least one of Transaction ID or Payment Screenshot must be provided.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newPayment = await PaymentService.submitPayment({
        userId: 'dev-user-123',
        userEmail: 'developer@omnibey.com',
        amount: parseFloat(amount),
        paymentMethod: method,
        senderIdentifier: senderId.trim(),
        transactionId: txnId.trim() || undefined,
        screenshotPath: screenshotName ? `proofs/${Date.now()}-${screenshotName}` : undefined,
      });

      setPayments([newPayment, ...payments]);
      setModalOpen(false);
      setSenderId('');
      setTxnId('');
      setScreenshotName('');
      success(`Payment #${newPayment.payment_reference} submitted! Admin has been notified.`);
    } catch (err: any) {
      error(err.message || 'Payment submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-page-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Payments &amp; Orders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manual verification through Binance, bKash, Nagad, Rocket, or Upay.
          </p>
        </div>

        <Button variant="glow" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> Submit New Payment
        </Button>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Sender ID</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {payments.map((p) => {
                const isPending = p.status === 'pending';
                const isApproved = p.status === 'approved';
                const isRejected = p.status === 'rejected';

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      #{p.payment_reference}
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-slate-700 dark:text-slate-300">
                      {p.payment_method}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {p.sender_identifier}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {p.transaction_id || <span className="italic text-slate-400">Screenshot Attached</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                          <Clock className="w-3 h-3 animate-spin" /> Pending Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {isRejected && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-[10px]"
                          title={p.rejection_reason || 'Rejected by admin'}
                        >
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(p.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment orders submitted yet. Click &quot;Submit New Payment&quot; above to recharge credits.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Submission Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Manual Payment">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Method Selection */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['bkash', 'nagad', 'rocket', 'upay', 'binance'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`p-2 rounded-xl border text-center uppercase font-bold text-[11px] transition-all cursor-pointer ${
                    method === m
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-sky-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Destination Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {paymentDestinations[method].name}
              </span>
              <button
                type="button"
                onClick={handleCopyTarget}
                className="text-[11px] text-indigo-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedTarget ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedTarget ? 'Copied' : 'Copy Number/Wallet'}
              </button>
            </div>
            <div className="font-mono text-sm font-extrabold text-slate-900 dark:text-white select-all break-all">
              {paymentDestinations[method].target}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {paymentDestinations[method].instructions}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Payment Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Sender Identifier (REQUIRED) */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Sender Number or Wallet Identifier <span className="text-rose-500">*REQUIRED</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 01XXXXXXXXX or Binance Pay ID"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Transaction ID (OPTIONAL) */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Transaction ID / TrxID <span className="text-slate-400">(Optional if screenshot provided)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 9J1829KD01"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Screenshot (OPTIONAL) */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Payment Screenshot <span className="text-slate-400">(Optional if Transaction ID provided)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <Upload className="w-4 h-4 text-indigo-500" />
                <span className="truncate">{screenshotName || 'Attach receipt screenshot (Max 5MB)'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              * Note: Upon admin approval, proof screenshots are deleted immediately to safeguard privacy and free storage.
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="glow" size="md" className="w-full" isLoading={isSubmitting}>
              Submit Verification Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function DashboardPaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-xs">Loading payments...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
