'use client';

import React, { useState } from 'react';
import { Coins, Plus, Edit, Check, Trash2, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function AdminCreditsPackagesPage() {
  const [packages, setPackages] = useState([
    {
      id: 'starter',
      name: 'Starter Box',
      price: 5.0,
      credits: 250,
      bonus: 25,
      active: true,
    },
    {
      id: 'pro-qa',
      name: 'Pro QA Pack',
      price: 15.0,
      credits: 1000,
      bonus: 150,
      active: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      price: 45.0,
      credits: 4000,
      bonus: 800,
      active: true,
    },
  ]);

  const { success } = useToast();

  const handleToggle = (id: string) => {
    setPackages(packages.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
    success('Package status updated.');
  };

  return (
    <div className="space-y-6 animate-page-fade">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Credit Packages &amp; Store Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 18 &amp; 30 compliant configuration of user credit packages and bonus credit allocations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900 dark:text-white">{pkg.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  pkg.active
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400'
                }`}
              >
                {pkg.active ? 'Active' : 'Disabled'}
              </span>
            </div>

            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${pkg.price.toFixed(2)}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Standard Credits:</span>
                <span className="font-bold">{pkg.credits}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Bonus Credits:</span>
                <span className="font-bold text-indigo-600 dark:text-sky-400">+{pkg.bonus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Total User Receives:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {pkg.credits + pkg.bonus}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleToggle(pkg.id)}
              >
                {pkg.active ? 'Disable Package' : 'Enable Package'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
