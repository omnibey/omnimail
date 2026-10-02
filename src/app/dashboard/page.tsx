'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Key,
  Shield,
  Clock,
  Trash2,
  Plus,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
  Check,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getLocalRecentMailboxes, removeLocalMailbox } from '@/lib/session/anonymous-session';
import { nanoid } from 'nanoid';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'mailboxes' | 'api-keys' | 'settings'>('mailboxes');
  const [mailboxes, setMailboxes] = useState<Array<{ address: string; id: string }>>([]);
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; key: string; createdAt: string }>>([
    {
      id: 'key_1',
      name: 'CI/CD Playwright Tests',
      key: 'ob_live_8f93a90b4e2348a',
      createdAt: '2026-10-01',
    },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    setMailboxes(getLocalRecentMailboxes());
  }, []);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    success('API Key copied to clipboard');
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const newKey = {
      id: `key_${nanoid(8)}`,
      name: newKeyName.trim(),
      key: `ob_live_${nanoid(24)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setShowKeyModal(false);
    success(`API Key "${newKey.name}" created!`);
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    success('API key revoked');
  };

  const handleDeleteMailbox = (address: string) => {
    removeLocalMailbox(address);
    setMailboxes(getLocalRecentMailboxes());
    success(`Removed mailbox ${address}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">OmniBey Console</h1>
            <Badge variant="purple">OmniMail MVP</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your temporary mailboxes, developer API credentials, and email routing settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="glow" size="sm">
              <Inbox className="w-4 h-4" /> Go to Live Inbox
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Addresses</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{mailboxes.length || 1}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active in current session
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Cloudflare Edge Routing</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">&lt; 85ms</div>
          <div className="text-[11px] text-sky-400 mt-1">Average ingestion time</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Security Layer</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">RLS Active</div>
          <div className="text-[11px] text-slate-400 mt-1">PostgreSQL isolated tables</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Subscription Plan</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">Free Tier</div>
          <div className="text-[11px] text-indigo-400 mt-1">
            <Link href="/pricing" className="hover:underline">
              Upgrade to Pro &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('mailboxes')}
          className={`pb-3 px-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'mailboxes'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" /> Mailboxes ({mailboxes.length})
        </button>
        <button
          onClick={() => setActiveTab('api-keys')}
          className={`pb-3 px-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'api-keys'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" /> API Keys ({apiKeys.length})
        </button>
      </div>

      {/* Tab 1: Mailboxes */}
      {activeTab === 'mailboxes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Active Mailboxes</h3>
            <Link href="/">
              <Button variant="secondary" size="sm">
                <Plus className="w-3.5 h-3.5" /> Create Mailbox
              </Button>
            </Link>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 divide-y divide-slate-800">
            {mailboxes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No mailboxes stored in this session yet.{' '}
                <Link href="/" className="text-indigo-400 hover:underline">
                  Generate your first temporary address
                </Link>
              </div>
            ) : (
              mailboxes.map((mb) => (
                <div key={mb.address} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-mono font-medium text-white truncate">{mb.address}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>ID: {mb.id}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400">Active</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/?mailbox=${encodeURIComponent(mb.address)}`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        Open Inbox
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMailbox(mb.address)}
                      className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: API Keys */}
      {activeTab === 'api-keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Developer REST API Keys</h3>
              <p className="text-xs text-slate-400">Use these keys to authenticate automated E2E test suites</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowKeyModal(true)}>
              <Plus className="w-3.5 h-3.5" /> Generate Key
            </Button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 divide-y divide-slate-800">
            {apiKeys.map((k) => (
              <div key={k.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{k.name}</div>
                  <div className="font-mono text-xs text-sky-400 mt-1 bg-slate-950 px-2 py-1 rounded inline-block">
                    {k.key}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Created on {k.createdAt}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleCopyKey(k.key)} className="text-xs">
                    <Copy className="w-3 h-3" /> Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteApiKey(k.id)}
                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick API usage snippet */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            <div className="text-slate-400 mb-2 font-sans font-semibold">Example cURL Request:</div>
            <pre className="text-sky-300 overflow-x-auto whitespace-pre">
{`curl -X POST https://omnibey.com/api/mailboxes \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>
        </div>
      )}

      {/* Create Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateApiKey}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Create Developer API Key</h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Key Description / Purpose</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Cypress E2E Email Verification"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowKeyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Generate Key
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
