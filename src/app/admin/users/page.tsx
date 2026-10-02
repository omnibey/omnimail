'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Coins,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Plus,
  Minus,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { UserService } from '@/lib/services/UserService';
import { CreditService } from '@/lib/services/CreditService';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Credit Adjustment Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('50');
  const [adjustReason, setAdjustReason] = useState<string>('Customer support goodwill adjustment');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const { success, error, info } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.listUsers({ search, role: roleFilter });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user: any) => {
    const nextStatus = !user.is_active;
    try {
      await UserService.setUserStatus(user.id, nextStatus, 'admin-alex');
      setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: nextStatus } : u)));
      if (nextStatus) {
        success(`User ${user.email} activated.`);
      } else {
        info(`User ${user.email} suspended.`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to toggle status.');
    }
  };

  const handleCreditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount === 0) {
      error('Please enter a valid credit amount.');
      return;
    }

    setIsAdjusting(true);
    try {
      await CreditService.addTransaction({
        userId: selectedUser.id,
        amount,
        type: 'admin_adjustment',
        description: `Admin adjustment: ${adjustReason}`,
        metadata: { admin: 'alex.mercer' },
      });

      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, credits: Math.max(0, u.credits + amount) } : u
        )
      );

      success(`Adjusted ${amount > 0 ? `+${amount}` : amount} credits for ${selectedUser.email}`);
      setSelectedUser(null);
    } catch (err: any) {
      error(err.message || 'Credit adjustment failed.');
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-6 animate-page-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Directory &amp; RBAC
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, suspend/activate accounts, and adjust user credit balances with audit logging.
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          {['all', 'user', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg uppercase font-semibold text-[11px] transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
      </form>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Credits</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {u.full_name || 'Anonymous User'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono block">{u.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {u.role === 'admin' && <ShieldAlert className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold font-mono text-slate-900 dark:text-white">
                    {u.credits}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-750 text-indigo-600 dark:text-sky-400 hover:bg-indigo-50 dark:hover:bg-slate-800 text-[11px] font-semibold cursor-pointer"
                        title="Adjust Credits"
                      >
                        <Coins className="w-3 h-3 inline mr-1" />
                        Credits
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                          u.is_active
                            ? 'border-rose-300 dark:border-rose-900 text-rose-600 hover:bg-rose-500/10'
                            : 'border-emerald-300 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-500/10'
                        }`}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Adjustment Modal */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={`Adjust Credits for ${selectedUser?.email}`}
      >
        {selectedUser && (
          <form onSubmit={handleCreditAdjustment} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
              <span className="text-slate-500">Current Credit Balance:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {selectedUser.credits} Credits
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Credit Amount to Add or Deduct (Use negative number to deduct)
              </label>
              <input
                type="number"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for Adjustment (Recorded in Audit Log)
              </label>
              <textarea
                rows={2}
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" size="md" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="glow" size="md" isLoading={isAdjusting}>
                Confirm Adjustment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
