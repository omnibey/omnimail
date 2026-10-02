'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Coins,
  Send,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PaymentService } from '@/lib/services/PaymentService';

interface AdminPaymentItem {
  id: string;
  payment_reference: string;
  amount: number;
  currency: string;
  payment_method: string;
  sender_identifier: string;
  transaction_id?: string;
  screenshot_path?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
  profiles?: { email: string; full_name?: string };
  user_email?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { success, error, info } = useToast();

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await PaymentService.getAllPayments(filter);
      setPayments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const handleOpenReview = (payment: AdminPaymentItem, type: 'approve' | 'reject') => {
    setSelectedPayment(payment);
    setActionType(type);
    setRejectionReason('');
  };

  const handleConfirmReview = async () => {
    if (!selectedPayment || !actionType) return;

    if (actionType === 'reject' && !rejectionReason.trim()) {
      error('Please provide a rejection reason for user transparency.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await PaymentService.reviewPayment({
        paymentId: selectedPayment.id,
        adminId: 'admin-alex-mercer',
        adminEmail: 'alex.admin@omnibey.com',
        action: actionType,
        rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
      });

      if (actionType === 'approve') {
        success(
          `Payment #${selectedPayment.payment_reference} approved! ${res.credits_added || 250} credits credited and proof screenshot purged.`
        );
      } else {
        info(`Payment #${selectedPayment.payment_reference} marked as rejected.`);
      }

      setSelectedPayment(null);
      setActionType(null);
      loadPayments();
    } catch (err: any) {
      error(err.message || 'Transaction failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const term = search.toLowerCase();
    const ref = p.payment_reference.toLowerCase();
    const sender = p.sender_identifier.toLowerCase();
    const txn = (p.transaction_id || '').toLowerCase();
    const email = (p.profiles?.email || p.user_email || '').toLowerCase();
    return ref.includes(term) || sender.includes(term) || txn.includes(term) || email.includes(term);
  });

  return (
    <div className="space-y-6 animate-page-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Payment Verification Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold">
              Idempotent Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review manual transfers (Binance, bKash, Nagad, Rocket, Upay). Approved orders credit users once and purge screenshots.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search reference, sender ID, TrxID, user email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Verification Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Method &amp; Amount</th>
                <th className="py-3 px-4">Sender ID</th>
                <th className="py-3 px-4">Transaction ID / Proof</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredPayments.map((p) => {
                const isPending = p.status === 'pending';
                const isApproved = p.status === 'approved';
                const isRejected = p.status === 'rejected';

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      #{p.payment_reference}
                    </td>
                    <td className="py-3 px-4 truncate max-w-[160px]">
                      <span className="font-semibold block truncate">
                        {p.profiles?.full_name || p.user_email || 'Developer'}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {p.profiles?.email || 'developer@omnibey.com'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        ${p.amount.toFixed(2)}
                      </span>
                      <span className="text-[11px] uppercase font-semibold text-indigo-600 dark:text-sky-400">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {p.sender_identifier}
                    </td>
                    <td className="py-3 px-4">
                      {p.transaction_id ? (
                        <span className="font-mono text-xs font-bold block">{p.transaction_id}</span>
                      ) : null}
                      {p.screenshot_path ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                          <Eye className="w-3 h-3" /> Screenshot Provided
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                          <Clock className="w-3 h-3 animate-spin" /> Pending
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
                          title={p.rejection_reason}
                        >
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenReview(p, 'approve')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReview(p, 'reject')}
                            className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No payment orders found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Action Modal (Approve / Reject) */}
      <Modal
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        title={actionType === 'approve' ? 'Approve Payment & Grant Credits' : 'Reject Payment Submission'}
      >
        {selectedPayment && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  #{selectedPayment.payment_reference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount &amp; Method:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ${selectedPayment.amount.toFixed(2)} via {selectedPayment.payment_method.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sender ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedPayment.sender_identifier}
                </span>
              </div>
              {selectedPayment.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedPayment.transaction_id}
                  </span>
                </div>
              )}
            </div>

            {actionType === 'approve' ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Idempotent Transaction Safety Guarantee
                </div>
                <p className="text-[11px] leading-relaxed">
                  Approving will atomically add credits to the user profile, record an immutable transaction log, send a Telegram alert, and delete the temporary proof screenshot from Supabase Storage.
                </p>
              </div>
            ) : (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Rejection Reason <span className="text-rose-500">*Required</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Sender number does not match receipt, transaction ID already used, invalid amount..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedPayment(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="glow"
                size="md"
                onClick={handleConfirmReview}
                isLoading={isProcessing}
                className={actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-500 text-white' : ''}
              >
                {actionType === 'approve' ? 'Confirm Approval & Credit' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
