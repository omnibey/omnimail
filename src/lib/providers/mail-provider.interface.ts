import { ParsedEmailResult } from '@/lib/email/parser';

export type ProviderType = 'inbound' | 'outbound' | 'bidirectional';

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  message?: string;
}

export interface MailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;

  /**
   * Initializes connections or verifies credentials
   */
  initialize(): Promise<void>;

  /**
   * Parses and normalizes incoming raw email data into standard ParsedEmailResult
   */
  processInbound(payload: unknown, headers?: Headers): Promise<ParsedEmailResult>;

  /**
   * Optional outbound sending capability (for future bidirectional support)
   */
  sendOutbound?(params: {
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;

  /**
   * Health probe for monitoring provider uptime
   */
  checkHealth(): Promise<ProviderHealth>;
}
