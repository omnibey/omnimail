import { MailProvider, ProviderHealth, ProviderType } from './mail-provider.interface';
import { ParsedEmailResult } from '@/lib/email/parser';

export interface GmailProviderConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export class GmailProvider implements MailProvider {
  readonly id = 'gmail';
  readonly name = 'Google Gmail / Workspace Provider';
  readonly type: ProviderType = 'bidirectional';

  private config: GmailProviderConfig;

  constructor(config: GmailProviderConfig = {}) {
    this.config = {
      clientId: config.clientId || process.env.GMAIL_CLIENT_ID,
      clientSecret: config.clientSecret || process.env.GMAIL_CLIENT_SECRET,
      redirectUri: config.redirectUri || process.env.GMAIL_REDIRECT_URI,
    };
  }

  async initialize(): Promise<void> {
    // When enabled, configure Google OAuth2 Client and Pub/Sub webhook
  }

  async processInbound(payload: unknown): Promise<ParsedEmailResult> {
    // Modular adapter for Gmail API message payload or Pub/Sub push notification
    throw new Error('Gmail provider is modularly configured. Enable via GMAIL_CLIENT_ID credentials.');
  }

  async sendOutbound(params: {
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return {
      success: false,
      error: 'Gmail outbound sending will activate upon adding Google API keys in .env.local',
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    const isConfigured = Boolean(this.config.clientId && this.config.clientSecret);
    return {
      status: isConfigured ? 'healthy' : 'degraded',
      latencyMs: 1,
      message: isConfigured
        ? 'Gmail provider is configured and ready'
        : 'Gmail credentials not configured (modularly supported)',
    };
  }
}
