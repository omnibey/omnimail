import React from 'react';
import {
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  Layers,
  Code2,
  Trash2,
  KeyRound,
} from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      title: 'Cloudflare Edge Routing',
      description: 'Incoming emails are received and parsed at edge points worldwide with sub-second delivery latency and zero server bottleneck.',
      icon: Globe2,
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'Instant OTP Auto-Detection',
      description: 'Automatically detects 4-8 digit verification codes and 2FA PINs from incoming emails with a 1-click quick copy pill.',
      icon: KeyRound,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Supabase PostgreSQL & RLS',
      description: 'Built-in Row Level Security guarantees that anonymous sessions and registered users only access their authorized mailboxes.',
      icon: Lock,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Auto-Purge & Zero Retention',
      description: 'Automated database stored procedures wipe expired mailboxes, messages, and attachment files to ensure zero data liability.',
      icon: Trash2,
      color: 'from-rose-500 to-red-600',
    },
    {
      title: 'Sandboxed HTML Security',
      description: 'Emails are sanitized with script stripping, URI disarming, and target sandboxing to eliminate tracking pixels and XSS.',
      icon: ShieldCheck,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Developer REST API',
      description: 'Generate disposable inboxes, query incoming OTP verification codes, and trigger webhooks in automated Playwright/Cypress tests.',
      icon: Code2,
      color: 'from-cyan-500 to-indigo-600',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Engineered For Production
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
          Everything You Need In A Disposable Email Platform
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
          From developer automated testing to personal privacy, OmniMail is built from the ground up for low-cost scalability and uncompromising reliability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform`}
            >
              <f.icon className="w-5 h-5" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-sky-300 transition-colors">
              {f.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
