'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, Copy, Check, ExternalLink, Code2, Server, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
  -d '{"domain": "omnibey.com"}'`;

  const nodeExample = `import axios from 'axios';

// 1. Create a disposable mailbox
const { data: mb } = await axios.post('https://omnibey.com/api/mailboxes', {
  domain: 'omnibey.com'
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

# 1. Create disposable address
res = requests.post("https://omnibey.com/api/mailboxes", json={"domain": "omnibey.com"})
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 w-fit mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>OmniBey Developer Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          OmniMail REST API Documentation
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
          Automate temporary email generation, retrieve incoming messages, and extract one-time OTP codes in your automated CI/CD and QA pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-slate-300 uppercase tracking-wider mb-2 px-2">Endpoints</div>
          <a href="#create-mailbox" className="block px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            POST /api/mailboxes
          </a>
          <a href="#list-messages" className="block px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            GET /api/mailboxes/{'{id}'}/messages
          </a>
          <a href="#send-test" className="block px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            POST /api/email/send-test
          </a>
          <a href="#ingest" className="block px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            POST /api/email/ingest (Webhook)
          </a>
          <a href="#code-examples" className="block px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            Code Examples (Node &amp; Python)
          </a>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-3 space-y-12 text-sm text-slate-300">
          {/* Base URL */}
          <section className="glass-card p-5 rounded-2xl border border-slate-800">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Base URL</h3>
            <div className="font-mono text-sm text-sky-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              https://omnibey.com/api
            </div>
          </section>

          {/* Endpoint 1: POST /api/mailboxes */}
          <section id="create-mailbox" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                POST
              </span>
              <code className="text-white text-base font-semibold font-mono">/api/mailboxes</code>
            </div>
            <p className="text-xs text-slate-400">
              Generates a new disposable mailbox on any available domain with an automatic 60-minute expiration window.
            </p>

            <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
              <button
                onClick={() => handleCopy(curlExample, 'curl')}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
              >
                {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre className="text-slate-300">{curlExample}</pre>
            </div>
          </section>

          {/* Endpoint 2: GET /api/mailboxes/[id]/messages */}
          <section id="list-messages" className="space-y-4 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 font-mono text-xs font-bold">
                GET
              </span>
              <code className="text-white text-base font-semibold font-mono">/api/mailboxes/{'{id}'}/messages</code>
            </div>
            <p className="text-xs text-slate-400">
              Retrieves all inbound messages received by the temporary mailbox, sorted with newest first.
            </p>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs">
              <div className="text-slate-500 mb-2">// Response 200 OK</div>
              <pre className="text-indigo-300">
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
          <section id="code-examples" className="space-y-6 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white">Full E2E Testing Examples</h2>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">TypeScript / Node.js (Playwright / Cypress)</span>
                <button
                  onClick={() => handleCopy(nodeExample, 'node')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedSection === 'node' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-slate-300">{nodeExample}</pre>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Python 3 (Requests &amp; PyTest)</span>
                <button
                  onClick={() => handleCopy(pythonExample, 'py')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedSection === 'py' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-slate-300">{pythonExample}</pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
