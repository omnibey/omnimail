'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { success } = useToast();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    success('Snippet copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlExample = `curl -X POST https://omnibey.com/api/mailboxes \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "mail.omnibey.com"}'`;

  const nodeExample = `import axios from 'axios';

// 1. Create a disposable mailbox
const { data: mb } = await axios.post('https://omnibey.com/api/mailboxes', {
  domain: 'mail.omnibey.com'
});
console.log('Address:', mb.mailbox.address);

// 2. Poll for verification code in tests
const pollForOtp = async (mailboxId) => {
  for (let i = 0; i < 15; i++) {
    const res = await axios.get(\`https://omnibey.com/api/mailboxes/\${mailboxId}/messages\`);
    if (res.data.messages?.length > 0) {
      const latest = res.data.messages[0];
      const match = latest.bodyText?.match(/\\b\\d{6}\\b/);
      return match ? match[0] : null;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('OTP timed out');
};`;

  const pythonExample = `import requests
import time
import re

# 1. Create disposable address on mail.omnibey.com
res = requests.post("https://omnibey.com/api/mailboxes", json={"domain": "mail.omnibey.com"})
mailbox = res.json()["mailbox"]
print("Using temporary email:", mailbox["address"])

# 2. Wait for incoming message
for _ in range(15):
    msgs = requests.get(f"https://omnibey.com/api/mailboxes/{mailbox['id']}/messages").json().get("messages", [])
    if msgs:
        otp = re.search(r"\\b\\d{6}\\b", msgs[0]["bodyText"])
        if otp:
            print("Extracted 2FA Code:", otp.group(0))
            break
    time.sleep(2)`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 animate-page-fade">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-sky-400 bg-indigo-500/10 dark:bg-sky-500/10 px-3 py-1 rounded-full border border-indigo-500/20 dark:border-sky-500/20 w-fit mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>OmniBey Developer Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          OmniMail REST API Documentation
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
          Automate temporary email generation on <code className="text-indigo-600 dark:text-sky-300 font-mono">mail.omnibey.com</code>, retrieve incoming messages, and extract one-time OTP codes in your automated CI/CD and QA pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 px-2">Endpoints</div>
          <a href="#create-mailbox" className="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">
            POST /api/mailboxes
          </a>
          <a href="#list-messages" className="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">
            GET /api/mailboxes/{'{id}'}/messages
          </a>
          <a href="#send-test" className="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">
            POST /api/email/send-test
          </a>
          <a href="#ingest" className="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">
            POST /api/email/ingest (Webhook)
          </a>
          <a href="#code-examples" className="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">
            Code Examples (Node &amp; Python)
          </a>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-3 space-y-12 text-sm text-slate-700 dark:text-slate-300">
          {/* Base URL */}
          <section className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2">Base URL</h3>
              <div className="font-mono text-sm text-indigo-600 dark:text-sky-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                https://omnibey.com/api/v1
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2">Authentication Header</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Pass your API key in the header using either <code className="font-mono text-slate-900 dark:text-white">x-api-key</code> or <code className="font-mono text-slate-900 dark:text-white">Authorization: Bearer &lt;key&gt;</code>. Manage keys in your <a href="/dashboard/api-keys" className="text-indigo-600 dark:text-sky-400 underline font-semibold">Dashboard API Keys</a>.
              </p>
              <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                x-api-key: ob_live_8f93a90b4e2348a1928471b
              </div>
            </div>
          </section>

          {/* Endpoint 1: POST /api/mailboxes */}
          <section id="create-mailbox" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                POST
              </span>
              <code className="text-slate-900 dark:text-white text-base font-semibold font-mono">/api/mailboxes</code>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generates a new disposable mailbox on any available domain with an automatic 60-minute expiration window.
            </p>

            <div className="relative bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto shadow-md">
              <button
                onClick={() => handleCopy(curlExample, 'curl')}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre>{curlExample}</pre>
            </div>
          </section>

          {/* Endpoint 2: GET /api/mailboxes/[id]/messages */}
          <section id="list-messages" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono text-xs font-bold border border-sky-500/20">
                GET
              </span>
              <code className="text-slate-900 dark:text-white text-base font-semibold font-mono">/api/mailboxes/{'{id}'}/messages</code>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Retrieves all inbound messages received by the temporary mailbox, sorted with newest first.
            </p>

            <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs shadow-md">
              <div className="text-slate-500 mb-2">// Response 200 OK</div>
              <pre className="text-sky-300">
{`{
  "success": true,
  "messages": [
    {
      "id": "msg_904128",
      "sender": "auth@service.com",
      "senderName": "Auth Service",
      "subject": "Your Verification Code: 492011",
      "snippet": "Use code 492011 to verify your account...",
      "bodyText": "Your verification code is 492011",
      "spfStatus": "pass",
      "dkimStatus": "pass",
      "receivedAt": "2026-10-02T20:30:00Z"
    }
  ]
}`}
              </pre>
            </div>
          </section>

          {/* Code Examples */}
          <section id="code-examples" className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Full E2E Testing Examples</h2>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">TypeScript / Node.js (Playwright / Cypress)</span>
                <button
                  onClick={() => handleCopy(nodeExample, 'node')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'node' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto shadow-md">
                <pre className="text-slate-200">{nodeExample}</pre>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Python 3 (Requests &amp; PyTest)</span>
                <button
                  onClick={() => handleCopy(pythonExample, 'py')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'py' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto shadow-md">
                <pre className="text-slate-200">{pythonExample}</pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
