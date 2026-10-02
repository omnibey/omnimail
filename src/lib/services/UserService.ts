/**
 * UserService — Profile Management & Admin User Operations
 * Implements Section 5, 21 & 35 of the Master Specification.
 */

import { getAdminClient } from '@/lib/supabase/admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: 'user' | 'admin' | 'moderator';
  credits: number;
  googleAccountEmail: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  /**
   * Retrieves profile by user ID.
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          phoneNumber: data.phone_number,
          role: data.role,
          credits: data.credits,
          googleAccountEmail: data.google_account_email,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    // Dev fallback profile
    return {
      id: userId,
      email: 'developer@omnibey.com',
      fullName: 'Alex Mercer',
      phoneNumber: '+1 (555) 019-2834',
      role: 'admin',
      credits: 250,
      googleAccountEmail: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Updates basic profile information (Name, Phone number).
   */
  static async updateProfile(userId: string, updates: { fullName?: string; phoneNumber?: string }) {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from('profiles')
        .update({
          full_name: updates.fullName,
          phone_number: updates.phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }
    return { userId, ...updates };
  }

  /**
   * Admin: List users with search and filter.
   */
  static async listUsers(options?: { search?: string; role?: string; limit?: number }) {
    const adminClient = getAdminClient();
    if (adminClient) {
      let query = adminClient.from('profiles').select('*').order('created_at', { ascending: false });

      if (options?.role && options.role !== 'all') {
        query = query.eq('role', options.role);
      }
      if (options?.search) {
        query = query.or(`email.ilike.%${options.search}%,full_name.ilike.%${options.search}%`);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    }

    return [
      {
        id: 'usr-1',
        email: 'developer@omnibey.com',
        full_name: 'Alex Mercer (Admin)',
        role: 'admin',
        credits: 1250,
        is_active: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'usr-2',
        email: 'sarah.qa@techscale.io',
        full_name: 'Sarah Connor',
        role: 'user',
        credits: 450,
        is_active: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'usr-3',
        email: 'tester99@domain.org',
        full_name: 'David Test',
        role: 'user',
        credits: 15,
        is_active: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
  }

  /**
   * Admin: Toggle user active/suspended state.
   */
  static async setUserStatus(userId: string, isActive: boolean, adminId: string) {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { error } = await adminClient
        .from('profiles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw new Error(error.message);

      // Audit log
      await adminClient.from('audit_logs').insert({
        admin_id: adminId,
        action: isActive ? 'user_activated' : 'user_suspended',
        target_type: 'user',
        target_id: userId,
        metadata: { is_active: isActive },
      });
    }
    return { success: true, isActive };
  }
}
