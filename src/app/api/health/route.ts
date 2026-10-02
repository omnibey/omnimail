import { NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, createAdminClient } from '@/lib/supabase/admin';
import { providerRegistry } from '@/lib/providers/registry';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'disconnected (dev fallback)';
  let storageStatus = 'disconnected (dev fallback)';
  let dbLatency = 0;

  if (isSupabaseAdminConfigured()) {
    try {
      const dbStart = Date.now();
      const adminClient = createAdminClient();
      const { error } = await adminClient.from('domains').select('count', { count: 'exact', head: true });
      dbLatency = Date.now() - dbStart;
      dbStatus = error ? `error: ${error.message}` : 'healthy';

      // Check storage
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'omnimail-attachments';
      const { data: buckets } = await adminClient.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === bucketName);
      storageStatus = bucketExists ? `connected (bucket: ${bucketName})` : `bucket not found (${bucketName})`;
    } catch (e: unknown) {
      dbStatus = e instanceof Error ? e.message : 'unreachable';
    }
  }

  const providers = await providerRegistry.getProvidersHealth();

  return NextResponse.json({
    status: 'healthy',
    system: 'OmniBey Platform',
    product: 'OmniMail',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - start,
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
    },
    storage: {
      status: storageStatus,
    },
    providers,
    environment: {
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      defaultDomain: process.env.NEXT_PUBLIC_DEFAULT_MAIL_DOMAIN || 'omnibey.com',
      availableDomains: (process.env.NEXT_PUBLIC_AVAILABLE_DOMAINS || 'omnibey.com').split(','),
      cloudflareEnabled: process.env.ENABLE_CLOUDFLARE_ROUTING === 'true',
      gmailEnabled: process.env.ENABLE_GMAIL_INTEGRATION === 'true',
      outlookEnabled: process.env.ENABLE_OUTLOOK_INTEGRATION === 'true',
    },
  });
}
