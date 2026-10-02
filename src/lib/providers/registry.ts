import { MailProvider } from './mail-provider.interface';
import { CloudflareEmailProvider } from './cloudflare-provider';
import { GmailProvider } from './gmail-provider';
import { OutlookProvider } from './outlook-provider';
import { MockProvider } from './mock-provider';

class ProviderRegistryService {
  private providers = new Map<string, MailProvider>();
  private defaultInboundProviderId: string = 'cloudflare';

  constructor() {
    this.register(new CloudflareEmailProvider());
    this.register(new GmailProvider());
    this.register(new OutlookProvider());
    this.register(new MockProvider());
  }

  register(provider: MailProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): MailProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): MailProvider[] {
    return Array.from(this.providers.values());
  }

  getDefaultInboundProvider(): MailProvider {
    return this.providers.get(this.defaultInboundProviderId) || new MockProvider();
  }

  async getProvidersHealth() {
    const healthResults: Record<string, unknown> = {};
    for (const [id, provider] of this.providers.entries()) {
      try {
        healthResults[id] = await provider.checkHealth();
      } catch (err: unknown) {
        healthResults[id] = {
          status: 'offline',
          latencyMs: 0,
          message: err instanceof Error ? err.message : 'Health check failed',
        };
      }
    }
    return healthResults;
  }
}

export const providerRegistry = new ProviderRegistryService();
