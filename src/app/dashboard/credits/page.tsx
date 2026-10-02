'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreditService, CreditPackage } from '@/lib/services/CreditService';

export default function DashboardCreditsPage() {
  const [balance, setBalance] = useState<number>(250);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCreditData() {
      try {
        const [pkgs, history, curBalance] = await Promise.all([
          CreditService.getPackages(),
          CreditService.getUserHistory('dev-user-123'),
          CreditService.getUserBalance('dev-user-123'),
        ]);
        setPackages(pkgs);
        setTransactions(history);
        setBalance(curBalance || 250);
      } finally {
        setLoading(false);
      }
    }
    loadCreditData();
  }, []);

  return (
    <div className="space-y-8 animate-page-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Credits &amp; Store
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Recharge your account balance with manual verification (Binance, bKash, Nagad, Rocket, Upay).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold">Current Balance:</span>
            <span className="text-sm font-extrabold">{balance} Credits</span>
          </div>
          <Link href="/dashboard/payments">
            <Button variant="glow" size="sm">
              <CreditCard className="w-3.5 h-3.5" /> Submit Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Package Options Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Available Credit Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isPopular = pkg.id.includes('pro');
            return (
              <div
                key={pkg.id}
                className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all relative flex flex-col justify-between ${
                  isPopular
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    {pkg.description}
                  </p>

                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      ${pkg.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ one-time</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <strong className="text-slate-900 dark:text-white font-bold">{pkg.credits}</strong> standard credits
                    </div>
                    {pkg.bonusCredits > 0 && (
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-sky-400 font-semibold">
                        <Sparkles className="w-4 h-4 shrink-0" />
                        +{pkg.bonusCredits} bonus credits included
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      Manual verification (bKash, Binance, etc.)
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      No monthly subscription commitment
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href={`/dashboard/payments?package=${pkg.id}&amount=${pkg.price}`}>
                    <Button
                      variant={isPopular ? 'glow' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      Purchase Package <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Transaction Ledger (Section 18 Requirement) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-500" />
          Immutable Credit Ledger
        </h2>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Amount</th>
                <th className="py-3 px-4 text-center">Balance After</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                      {tx.id.slice(0, 12)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                        {tx.transaction_type || 'credit'}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-center font-bold font-mono ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                      {tx.balance_after}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
