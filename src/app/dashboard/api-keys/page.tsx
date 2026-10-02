'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  Clock,
  ExternalLink,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ApiKeyService, ApiKeyRecord } from '@/lib/services/ApiKeyService';

export default function DashboardApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { success, error, info } = useToast();

  const loadKeys = async () => {
    setLoading(true);
    try {
      const data = await ApiKeyService.listKeys('dev-user-123');
      setKeys(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      error('Please enter a descriptive key name.');
      return;
    }

    setIsCreating(true);
    try {
      const newKey = await ApiKeyService.createKey('dev-user-123', newKeyName.trim());
      setCreatedKey(newKey.rawKey || null);
      setNewKeyName('');
      loadKeys();
      success('API Key generated successfully! Be sure to copy it now.');
    } catch (err: any) {
      error(err.message || 'Failed to create key.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    success('Copied API key to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRevoke = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke the API key "${name}"? Any automated test scripts using this key will immediately stop working.`)) {
      await ApiKeyService.revokeKey(id, 'dev-user-123');
      setKeys(keys.filter((k) => k.id !== id));
      info(`Key "${name}" revoked.`);
    }
  };

  return (
    <div className="space-y-6 animate-page-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Developer API Keys
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
              v1 REST API
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and manage access tokens for Playwright, Cypress, Selenium, or custom automated test suites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/docs">
            <Button variant="secondary" size="sm">
              <BookOpen className="w-3.5 h-3.5" /> API Documentation
            </Button>
          </Link>
          <Button variant="glow" size="sm" onClick={() => { setCreatedKey(null); setModalOpen(true); }}>
            <Plus className="w-3.5 h-3.5" /> Generate New Key
          </Button>
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Key Name</th>
                <th className="py-3 px-4">Prefix</th>
                <th className="py-3 px-4 text-center">Rate Limit</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Last Used</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    {k.name}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {k.keyPrefix}••••••••••••
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {k.rateLimitPerMinute} req/min
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleRevoke(k.id, k.name)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No API keys created yet. Generate one above to automate temporary mailboxes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={createdKey ? 'API Key Generated!' : 'Create New API Key'}
      >
        {createdKey ? (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Copy your secret key now!</strong> For your security, this raw key will never be shown again. Store it securely in your test environment secrets.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 font-mono text-xs select-all break-all">
              <span className="font-bold text-slate-900 dark:text-white">{createdKey}</span>
              <button
                type="button"
                onClick={() => handleCopy(createdKey)}
                className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0 hover:bg-indigo-500 transition-colors"
                title="Copy Key"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="glow" size="md" onClick={() => setModalOpen(false)}>
                Done &amp; Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Key Label / Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CI/CD Playwright Tests or Staging QA"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="glow" size="md" isLoading={isCreating}>
                Generate Secret Key
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
