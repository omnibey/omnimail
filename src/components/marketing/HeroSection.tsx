import React from 'react';
import { Shield, Zap, Lock, Terminal, Cpu } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-6 pb-10 text-center max-w-4xl mx-auto px-4">
      {/* Glow highlight */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-6 shadow-inner">
        <Cpu className="w-3.5 h-3.5 text-sky-400" />
        <span>OmniBey Cloud Platform &bull; Production Release</span>
      </div>

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
        Disposable Email{' '}
        <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Without Compromise
        </span>
      </h1>

      <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
        <strong className="text-white">OmniMail</strong> delivers instant, high-speed temporary email powered by{' '}
        <span className="text-sky-300">Cloudflare Email Edge</span> and{' '}
        <span className="text-indigo-300">Supabase</span>. Protect your identity, bypass spam, and automate QA testing effortlessly.
      </p>

      {/* Feature highlights pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Logs Retention</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Sub-second Cloudflare Routing</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Row Level Security (RLS)</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>Developer API Ready</span>
        </div>
      </div>
    </section>
  );
};
