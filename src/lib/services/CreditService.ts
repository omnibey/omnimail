/**
 * CreditService — User Credits & Immutable Transaction Ledger
 * Implements Section 18 of the Master Specification.
 */

import { getAdminClient } from '@/lib/supabase/admin';

export type CreditTransactionType = 'purchase' | 'bonus' | 'usage' | 'refund' | 'admin_adjustment';

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits: number;
  bonusCredits: number;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

const defaultPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Box',
    price: 5.0,
    currency: 'USD',
    credits: 250,
    bonusCredits: 25,
    description: 'Perfect for light personal testing and verifications',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'pro-qa',
    name: 'Pro QA Pack',
    price: 15.0,
    currency: 'USD',
    credits: 1000,
    bonusCredits: 150,
    description: 'Recommended for regular developers and QA engineers',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    price: 45.0,
    currency: 'USD',
    credits: 4000,
    bonusCredits: 800,
    description: 'High volume package for automated test suites and teams',
    isActive: true,
    sortOrder: 3,
  },
];

export class CreditService {
  /**
   * Retrieves active credit packages available for purchase.
   */
  static async getPackages(): Promise<CreditPackage[]> {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          price: Number(pkg.price),
          currency: pkg.currency,
          credits: pkg.credits,
          bonusCredits: pkg.bonus_credits,
          description: pkg.description,
          isActive: pkg.is_active,
          sortOrder: pkg.sort_order,
        }));
      }
    }
    return defaultPackages;
  }

  /**
   * Retrieves current credit balance for a user.
   */
  static async getUserBalance(userId: string): Promise<number> {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data.credits;
      }
    }
    return 100; // Dev fallback
  }

  /**
   * Records an immutable credit transaction and adjusts the balance.
   */
  static async addTransaction(params: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    description: string;
    paymentId?: string;
    metadata?: Record<string, any>;
  }) {
    const adminClient = getAdminClient();
    if (adminClient) {
      // 1. Fetch current balance
      const current = await this.getUserBalance(params.userId);
      const newBalance = Math.max(0, current + params.amount);

      // 2. Update balance
      await adminClient
        .from('profiles')
        .update({ credits: newBalance, updated_at: new Date().toISOString() })
        .eq('id', params.userId);

      // 3. Insert immutable log
      const { data, error } = await adminClient
        .from('credit_transactions')
        .insert({
          user_id: params.userId,
          amount: params.amount,
          balance_after: newBalance,
          transaction_type: params.type,
          payment_id: params.paymentId || null,
          description: params.description,
          metadata: params.metadata || {},
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    return {
      id: `ctx-${Date.now()}`,
      balance_after: 100 + params.amount,
      ...params,
    };
  }

  /**
   * Retrieves full transaction ledger history for a user.
   */
  static async getUserHistory(userId: string) {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    }

    return [
      {
        id: 'ctx-1',
        amount: 50,
        balance_after: 50,
        transaction_type: 'bonus',
        description: 'Welcome bonus on sign up',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }
}
