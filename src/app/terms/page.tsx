import React from 'react';

export const metadata = {
  title: 'Terms of Service — OmniMail by OmniBey',
  description: 'Terms and acceptable use policy for OmniBey and OmniMail disposable email services.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 text-slate-300">
      <div className="pb-8 border-b border-slate-800 mb-8">
        <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400 mt-2">Effective Date: October 2, 2026 &bull; OmniBey Inc. (omnibey.com)</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using OmniBey (omnibey.com) or OmniMail (&ldquo;Temporary Email by OmniBey&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Acceptable Use Policy</h2>
          <p className="mb-2">
            OmniMail is intended for legitimate testing, QA automation, privacy protection, and evaluation purposes. You agree not to use the service for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Any illegal, fraudulent, or malicious activity</li>
            <li>Distributing phishing, malware, or unsolicited commercial email (spam)</li>
            <li>Attempting to bypass authentication or compromise third-party networks</li>
            <li>Circumventing service limits or disrupting the availability of Cloudflare Edge endpoints</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Nature of Disposable Temporary Email</h2>
          <p>
            OmniMail is a temporary email service. Mailboxes and messages are ephemeral and subject to expiration and permanent deletion. You should not use OmniMail for critical permanent communications, banking, legal notices, or high-value permanent accounts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Limitation of Liability</h2>
          <p>
            OmniBey provides the service &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo;. We do not guarantee uninterrupted delivery of emails, and we are not liable for any lost data or consequences arising from deleted disposable mailboxes.
          </p>
        </section>
      </div>
    </div>
  );
}
