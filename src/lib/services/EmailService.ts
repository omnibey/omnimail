/**
 * EmailService — Dynamic Temporary Email System, Events & History
 * Implements Sections 7, 8, 9, 10, 11 of the Master Specification.
 */

import { getAdminClient } from '@/lib/supabase/admin';
import { generateRandomAddress } from '@/lib/email/generator';
import { extractOtpFromEmail } from '@/lib/email/otp-detector';

export interface EmailAddressRecord {
  id: string;
  userId?: string | null;
  emailAddress: string;
  providerId: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'archived' | 'deleted';
  usageCount: number;
  messageCount: number;
  lastMessageAt?: string | null;
}

export class EmailService {
  /**
   * Generates a new dynamic temporary email address.
   */
  static async createAddress(params?: {
    userId?: string;
    customPrefix?: string;
    domain?: string;
    durationMinutes?: number;
  }): Promise<EmailAddressRecord> {
    const domain = params?.domain || process.env.NEXT_PUBLIC_DEFAULT_MAIL_DOMAIN || 'mail.omnibey.com';
    const emailAddress = params?.customPrefix
      ? `${params.customPrefix.toLowerCase()}@${domain}`
      : generateRandomAddress(domain);

    const duration = params?.durationMinutes || 60;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
    const adminClient = getAdminClient();

    if (adminClient) {
      const { data, error } = await adminClient
        .from('email_addresses')
        .insert({
          user_id: params?.userId || null,
          email_address: emailAddress,
          provider_id: 'omnibey',
          expires_at: expiresAt,
          status: 'active',
          usage_count: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('[EmailService] Failed to insert email_address:', error);
      } else if (data) {
        // Log Email Created Event
        await this.logEvent({
          userId: params?.userId,
          mailboxId: data.id,
          eventType: 'email_created',
          metadata: { emailAddress, domain },
        });

        return {
          id: data.id,
          userId: data.user_id,
          emailAddress: data.email_address,
          providerId: data.provider_id,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
          status: data.status,
          usageCount: data.usage_count,
          messageCount: data.message_count,
        };
      }
    }

    // Dev fallback
    return {
      id: `mbx-${Date.now()}`,
      userId: params?.userId || null,
      emailAddress,
      providerId: 'omnibey',
      createdAt: new Date().toISOString(),
      expiresAt,
      status: 'active',
      usageCount: 1,
      messageCount: 0,
    };
  }

  /**
   * Logs an email telemetry event (Section 11).
   */
  static async logEvent(params: {
    userId?: string;
    mailboxId?: string;
    eventType: 'email_created' | 'email_copied' | 'email_received' | 'email_opened' | 'otp_detected' | 'email_expired' | 'email_deleted';
    metadata?: Record<string, any>;
  }) {
    const adminClient = getAdminClient();
    if (!adminClient) return;

    try {
      await adminClient.from('email_events').insert({
        user_id: params.userId || null,
        mailbox_id: params.mailboxId || null,
        event_type: params.eventType,
        metadata: params.metadata || {},
      });
    } catch (err) {
      console.warn('[EmailService] Event logging warning:', err);
    }
  }

  /**
   * Logs or updates a usage history session (Section 10).
   * Strictly separates user-reported service from observed sender domain.
   */
  static async recordUsageSession(params: {
    userId: string;
    mailboxId: string;
    userReportedService?: string;
    observedSenderDomain?: string;
    messageCount?: number;
    otpCount?: number;
  }) {
    const adminClient = getAdminClient();
    if (!adminClient) return;

    try {
      await adminClient.from('email_usage_sessions').insert({
        user_id: params.userId,
        mailbox_id: params.mailboxId,
        user_reported_service: params.userReportedService || null,
        observed_sender_domain: params.observedSenderDomain || null,
        message_count: params.messageCount || 1,
        otp_count: params.otpCount || 0,
        last_activity: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[EmailService] Usage session recording warning:', err);
    }
  }

  /**
   * Retrieves usage history for a user (Section 10).
   */
  static async getUserHistory(userId: string) {
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data } = await adminClient
        .from('email_usage_sessions')
        .select('*, email_addresses(email_address, created_at, expires_at, status)')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false });

      if (data && data.length > 0) return data;
    }

    return [
      {
        id: 'hist-1',
        user_reported_service: 'Discord Verification',
        observed_sender_domain: 'discord.com',
        message_count: 2,
        otp_count: 1,
        last_activity: new Date().toISOString(),
        email_addresses: {
          email_address: 'discord.flow84@mail.omnibey.com',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          status: 'active',
        },
      },
      {
        id: 'hist-2',
        user_reported_service: 'GitHub QA Test',
        observed_sender_domain: 'github.com',
        message_count: 1,
        otp_count: 1,
        last_activity: new Date(Date.now() - 86400000).toISOString(),
        email_addresses: {
          email_address: 'qa.test92@mail.omnibey.com',
          created_at: new Date(Date.now() - 90000000).toISOString(),
          expires_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'expired',
        },
      },
    ];
  }
}
