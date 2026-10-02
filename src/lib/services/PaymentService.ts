/**
 * PaymentService — Manual Payment Gateway & Verification Engine
 * Implements Sections 14, 15, 16, 22 & 37 of Master Specification.
 */

import { getAdminClient } from '@/lib/supabase/admin';
import { TelegramService } from './TelegramService';

export type PaymentMethod = 'binance' | 'bkash' | 'nagad' | 'rocket' | 'upay';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface PaymentSubmissionInput {
  userId: string;
  userEmail: string;
  packageId?: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  senderIdentifier: string; // REQUIRED
  transactionId?: string;   // OPTIONAL
  screenshotPath?: string;  // OPTIONAL
  notes?: string;
}

export interface PaymentReviewInput {
  paymentId: string;
  adminId: string;
  adminEmail: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

// In-memory fallback ledger when Supabase DB is disconnected
const inMemoryPayments: any[] = [];
let paymentSequence = 10291;

export class PaymentService {
  /**
   * Generates a human-friendly unique payment reference. e.g. "PAY-10291"
   */
  static generateReference(): string {
    paymentSequence += Math.floor(Math.random() * 3) + 1;
    return `PAY-${paymentSequence}`;
  }

  /**
   * Validates business logic rules:
   * 1. Sender Number / Account Identifier is REQUIRED.
   * 2. At least one of Transaction ID OR Screenshot must be provided.
   */
  static validateSubmission(input: {
    senderIdentifier?: string;
    transactionId?: string;
    screenshotPath?: string;
  }): { valid: boolean; error?: string } {
    if (!input.senderIdentifier || input.senderIdentifier.trim() === '') {
      return { valid: false, error: 'Sender number or account identifier is required.' };
    }

    const hasTxn = Boolean(input.transactionId && input.transactionId.trim().length > 0);
    const hasScreenshot = Boolean(input.screenshotPath && input.screenshotPath.trim().length > 0);

    if (!hasTxn && !hasScreenshot) {
      return {
        valid: false,
        error: 'Please provide either a Transaction ID or upload a Payment Screenshot (at least one is required).',
      };
    }

    return { valid: true };
  }

  /**
   * Submits a new payment for admin verification.
   */
  static async submitPayment(input: PaymentSubmissionInput) {
    const validation = this.validateSubmission(input);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const reference = this.generateReference();
    const adminClient = getAdminClient();

    let record: any = null;

    if (adminClient) {
      const { data, error } = await adminClient
        .from('payments')
        .insert({
          payment_reference: reference,
          user_id: input.userId,
          package_id: input.packageId || null,
          amount: input.amount,
          currency: input.currency || 'USD',
          payment_method: input.paymentMethod,
          sender_identifier: input.senderIdentifier.trim(),
          transaction_id: input.transactionId?.trim() || null,
          screenshot_path: input.screenshotPath?.trim() || null,
          status: 'pending',
          metadata: input.notes ? { notes: input.notes } : {},
        })
        .select()
        .single();

      if (error) {
        console.error('[PaymentService] Database insert error:', error);
        throw new Error(`Failed to record payment: ${error.message}`);
      }
      record = data;
    } else {
      // Dev mode fallback
      record = {
        id: `dev-${Date.now()}`,
        payment_reference: reference,
        user_id: input.userId,
        user_email: input.userEmail,
        package_id: input.packageId,
        amount: input.amount,
        currency: input.currency || 'USD',
        payment_method: input.paymentMethod,
        sender_identifier: input.senderIdentifier,
        transaction_id: input.transactionId,
        screenshot_path: input.screenshotPath,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      };
      inMemoryPayments.unshift(record);
    }

    // Trigger asynchronous Telegram alert for Admin
    TelegramService.notifyNewPayment({
      paymentReference: reference,
      userEmail: input.userEmail,
      method: input.paymentMethod,
      amount: input.amount,
      currency: input.currency,
      senderIdentifier: input.senderIdentifier,
      transactionId: input.transactionId,
      status: 'Pending',
    }).catch((err) => console.error('[PaymentService] Telegram notify error:', err));

    return record;
  }

  /**
   * Reviews and processes a payment (Approve / Reject).
   * Enforces Section 16 strict idempotency and transaction-safety.
   */
  static async reviewPayment(input: PaymentReviewInput) {
    const adminClient = getAdminClient();

    if (input.action === 'approve') {
      if (adminClient) {
        // Execute atomic database function (stored procedure with row lock)
        const { data, error } = await adminClient.rpc('approve_payment_transaction', {
          p_payment_id: input.paymentId,
          p_admin_id: input.adminId,
        });

        if (error) {
          throw new Error(`Approval failed: ${error.message}`);
        }

        if (!data.success) {
          throw new Error(data.error || 'Approval transaction rejected.');
        }

        // Section 15: If payment had a screenshot, delete it immediately from Supabase Storage
        await this.purgeScreenshot(input.paymentId);

        // Telegram Notification
        await TelegramService.notifyPaymentReviewed({
          paymentReference: data.payment_reference,
          status: 'approved',
          adminEmail: input.adminEmail,
          creditsAdded: data.credits_added,
        });

        return data;
      } else {
        // In-memory dev fallback
        const payment = inMemoryPayments.find((p) => p.id === input.paymentId);
        if (!payment) throw new Error('Payment not found');
        if (payment.status === 'approved') return { success: true, message: 'Already approved' };

        payment.status = 'approved';
        payment.reviewed_by = input.adminId;
        payment.reviewed_at = new Date().toISOString();
        payment.screenshot_path = null;

        await TelegramService.notifyPaymentReviewed({
          paymentReference: payment.payment_reference,
          status: 'approved',
          adminEmail: input.adminEmail,
          creditsAdded: Math.floor(payment.amount * 50),
        });

        return { success: true, credits_added: Math.floor(payment.amount * 50) };
      }
    } else {
      // Rejection logic
      if (!input.rejectionReason) {
        throw new Error('Rejection reason is required.');
      }

      if (adminClient) {
        const { data, error } = await adminClient
          .from('payments')
          .update({
            status: 'rejected',
            rejection_reason: input.rejectionReason,
            reviewed_by: input.adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', input.paymentId)
          .select('payment_reference')
          .single();

        if (error) throw new Error(error.message);

        // Record in audit log
        await adminClient.from('audit_logs').insert({
          admin_id: input.adminId,
          action: 'payment_rejected',
          target_type: 'payment',
          target_id: input.paymentId,
          metadata: { reason: input.rejectionReason },
        });

        await TelegramService.notifyPaymentReviewed({
          paymentReference: data?.payment_reference || input.paymentId,
          status: 'rejected',
          adminEmail: input.adminEmail,
          reason: input.rejectionReason,
        });

        return { success: true, status: 'rejected' };
      } else {
        const payment = inMemoryPayments.find((p) => p.id === input.paymentId);
        if (payment) {
          payment.status = 'rejected';
          payment.rejection_reason = input.rejectionReason;
          payment.reviewed_by = input.adminId;
          payment.reviewed_at = new Date().toISOString();
        }
        return { success: true, status: 'rejected' };
      }
    }
  }

  /**
   * Helper to delete the proof screenshot immediately upon approval (Section 15).
   */
  private static async purgeScreenshot(paymentId: string) {
    const adminClient = getAdminClient();
    if (!adminClient) return;

    try {
      const { data: payment } = await adminClient
        .from('payments')
        .select('screenshot_path')
        .eq('id', paymentId)
        .single();

      if (payment?.screenshot_path) {
        await adminClient.storage.from('payment-proof').remove([payment.screenshot_path]);
        await adminClient
          .from('payments')
          .update({ screenshot_path: null })
          .eq('id', paymentId);
      }
    } catch (err) {
      console.warn('[PaymentService] Error cleaning up approved screenshot:', err);
    }
  }

  /**
   * Retrieves payments for a specific user.
   */
  static async getUserPayments(userId: string) {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from('payments')
        .select('*, credit_packages(name, credits)')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    }
    return inMemoryPayments.filter((p) => p.user_id === userId);
  }

  /**
   * Retrieves all payments for the admin panel.
   */
  static async getAllPayments(filterStatus?: string) {
    const adminClient = getAdminClient();
    if (adminClient) {
      let query = adminClient
        .from('payments')
        .select('*, profiles:user_id(email, full_name), credit_packages(name, credits)')
        .order('submitted_at', { ascending: false });

      if (filterStatus && filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    }
    return inMemoryPayments;
  }
}
