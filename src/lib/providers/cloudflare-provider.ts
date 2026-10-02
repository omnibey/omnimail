import { MailProvider, ProviderHealth, ProviderType } from './mail-provider.interface';
import { parseRawEmail, normalizeJsonPayload, ParsedEmailResult } from '@/lib/email/parser';
import { InboundEmailPayload } from '@/types/email';

export class CloudflareEmailProvider implements MailProvider {
  readonly id = 'cloudflare';
  readonly name = 'Cloudflare Email Routing';
  readonly type: ProviderType = 'inbound';

  private webhookSecret: string;

  constructor(secret?: string) {
    this.webhookSecret = secret || process.env.INGESTION_WEBHOOK_SECRET || '';
  }

  async initialize(): Promise<void> {
    // Verify required config
    if (!this.webhookSecret) {
      console.warn('[CloudflareEmailProvider] Warning: INGESTION_WEBHOOK_SECRET is not set.');
    }
  }

  /**
   * Verifies incoming webhook request authentication token
   */
  verifyWebhookAuth(authHeader?: string | null): boolean {
    if (!this.webhookSecret) return true; // dev fallback
    if (!authHeader) return false;

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    return token === this.webhookSecret;
  }

  async processInbound(payload: unknown): Promise<ParsedEmailResult> {
    // If raw MIME string or Buffer was sent
    if (typeof payload === 'string' || Buffer.isBuffer(payload)) {
      return await parseRawEmail(payload);
    }

    // If pre-parsed JSON from Cloudflare Worker
    const jsonPayload = payload as InboundEmailPayload;
    if (jsonPayload && jsonPayload.to && jsonPayload.from) {
      if (jsonPayload.rawMime) {
        return await parseRawEmail(jsonPayload.rawMime);
      }
      return normalizeJsonPayload(jsonPayload);
    }

    throw new Error('Unsupported payload format for CloudflareEmailProvider');
  }

  async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    const isConfigured = Boolean(this.webhookSecret);
    return {
      status: isConfigured ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      message: isConfigured
        ? 'Cloudflare Email Routing is ready to accept webhooks'
        : 'Webhook secret is not configured',
    };
  }
}
