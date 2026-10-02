import React from 'react';
import { Shield, Zap, Lock, Terminal, Cpu, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-6 pb-10 text-center max-w-4xl mx-auto px-4 animate-page-fade">
      {/* Top brand badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-6 shadow-xs">
        <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400" />
        <span>OmniBey Platform &bull; mail.omnibey.com</span>
      </div>

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
        Disposable Email{' '}
        <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-purple-600 bg-clip-text text-transparent">
          Without Compromise
        </span>
      </h1>

      <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
        <strong className="text-slate-900 dark:text-white">OmniMail</strong> delivers instant, high-speed temporary email on <span className="font-mono text-indigo-600 dark:text-sky-300 font-semibold">mail.omnibey.com</span> powered by{' '}
        <span className="text-slate-900 dark:text-white font-medium">Cloudflare Email Edge</span> and{' '}
        <span className="text-slate-900 dark:text-white font-medium">Supabase</span>. Protect your inbox from spam, extract 2FA OTP codes in seconds, and automate QA testing effortlessly.
      </p>

      {/* Feature highlights pills with theme adaptability */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zero Logs Retention</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Instant OTP Auto-Detection</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Sub-second Cloudflare Routing</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <Lock className="w-3.5 h-3.5 text-indigo-500" />
          <span>PostgreSQL RLS Security</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          <Terminal className="w-3.5 h-3.5 text-purple-500" />
          <span>Developer REST API</span>
        </div>
      </div>
    </section>
  );
};
