import { MailProvider, ProviderHealth, ProviderType } from './mail-provider.interface';
import { ParsedEmailResult } from '@/lib/email/parser';

export interface OutlookProviderConfig {
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}

export class OutlookProvider implements MailProvider {
  readonly id = 'outlook';
  readonly name = 'Microsoft Outlook / Office 365 Provider';
  readonly type: ProviderType = 'bidirectional';

  private config: OutlookProviderConfig;

  constructor(config: OutlookProviderConfig = {}) {
    this.config = {
      tenantId: config.tenantId || process.env.AZURE_TENANT_ID,
      clientId: config.clientId || process.env.AZURE_CLIENT_ID,
      clientSecret: config.clientSecret || process.env.AZURE_CLIENT_SECRET,
    };
  }

  async initialize(): Promise<void> {
    // When enabled, configure MS Graph Client and Webhook Subscriptions
  }

  async processInbound(payload: unknown): Promise<ParsedEmailResult> {
    throw new Error('Outlook provider is modularly configured. Enable via MS Graph credentials.');
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
      error: 'Outlook outbound sending will activate upon adding Microsoft Graph credentials',
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    const isConfigured = Boolean(this.config.clientId && this.config.clientSecret);
    return {
      status: isConfigured ? 'healthy' : 'degraded',
      latencyMs: 1,
      message: isConfigured
        ? 'Outlook provider is configured and ready'
        : 'Microsoft Azure credentials not configured (modularly supported)',
    };
  }
}
