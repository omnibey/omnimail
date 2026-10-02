'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Key,
  Lock,
  Save,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserService } from '@/lib/services/UserService';

export default function DashboardProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Alex Mercer');
  const [email, setEmail] = useState('developer@omnibey.com');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState('October 2, 2026');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const { success, error, info } = useToast();

  useEffect(() => {
    async function loadProfile() {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          setFullName(user.user_metadata?.full_name || 'OmniBey Member');
          setPhone(user.user_metadata?.phone_number || '');
          setCreatedAt(new Date(user.created_at).toLocaleDateString());
          if (user.app_metadata?.provider === 'google') {
            setGoogleEmail(user.email || null);
          }
        }
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
          data: { full_name: fullName, phone_number: phone },
        });
        if (updateError) throw updateError;
      }
      success('Profile details saved successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      error('New password must be at least 8 characters long.');
      return;
    }
    setIsChangingPass(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error: passError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passError) throw passError;
      }
      setCurrentPassword('');
      setNewPassword('');
      success('Password changed successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    document.cookie = 'omnibey_dev_session=; path=/; max-age=0';
    document.cookie = 'omnibey_dev_role=; path=/; max-age=0';
    info('Logged out.');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-4xl animate-page-fade">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile &amp; Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your identity, security credentials, and authentication preferences.
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-extrabold text-lg">
              {fullName.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{fullName}</h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{email}</span>
              <span>&bull;</span>
              <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Account
              </span>
            </div>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleLogout} className="text-rose-500 hover:text-rose-600">
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </Button>
      </div>

      {/* Profile Edit Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" /> Personal Information
        </h3>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email Address <span className="text-slate-400 font-normal">(Primary Login)</span>
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+880 1700-000000 or +1..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Linked Google Account
            </label>
            <input
              type="text"
              disabled
              value={googleEmail || 'Not linked via Google OAuth'}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2 pt-2 flex justify-end">
            <Button type="submit" variant="glow" size="md" isLoading={isSaving}>
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password Security Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-500" /> Security &amp; Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <Button type="submit" variant="secondary" size="md" isLoading={isChangingPass}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
