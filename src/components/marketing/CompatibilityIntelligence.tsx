'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, CheckCircle2, Clock, Info, ExternalLink, Sparkles } from 'lucide-react';
import { CompatibilityService, CompatibilityRecord } from '@/lib/services/CompatibilityService';

export const CompatibilityIntelligence: React.FC = () => {
  const [data, setData] = useState<CompatibilityRecord[]>([]);

  useEffect(() => {
    CompatibilityService.getSummaryList().then(setData);
  }, []);

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Cpu className="w-3.5 h-3.5" />
          Section 25 &bull; Compatibility Intelligence
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Observed Historical Delivery Intelligence
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Empirical telemetry monitoring edge deliverability across major global developer and authentication services.
        </p>
      </div>

      {/* Mandatory Section 25 Disclaimer Notice */}
      <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-slate-900 dark:text-white mb-0.5">Informational Estimate Notice:</strong>
          All ratings reflect <strong>observed historical data</strong> from edge delivery sessions. OmniMail never claims certainty or guarantees that any third-party external service will accept an email, as third-party acceptance policies remain outside our direct control.
        </div>
      </div>

      {/* Grid of Tested Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {data.map((item) => (
          <div
            key={item.serviceDomain}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.serviceDomain}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {item.confidence} Confidence
                </span>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {item.successRate}%
                </span>
                <span className="text-[11px] text-slate-400 ml-1.5">observed success</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{item.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Delivery:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-200">{item.averageDeliverySeconds}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Sample Size:</span>
                  <span>{item.totalTests.toLocaleString()} tests</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 text-[10px] text-slate-400 italic">
              Last observed: {item.lastTested}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
