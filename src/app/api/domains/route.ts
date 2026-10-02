import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { DomainItem } from '@/types/email';

export async function GET() {
  try {
    // 1. Try Supabase if configured
    if (isSupabaseAdminConfigured()) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('is_active', true)
        .order('is_premium', { ascending: true });

      if (!error && data && data.length > 0) {
        const domains: DomainItem[] = data.map((d) => ({
          id: d.id,
          domainName: d.domain_name,
          isActive: d.is_active,
          isPremium: d.is_premium,
          createdAt: d.created_at,
        }));
        return NextResponse.json({ success: true, domains });
      }
    }

    // 2. Fallback to environment variables
    const envDomains = (process.env.NEXT_PUBLIC_AVAILABLE_DOMAINS || 'omnibey.com,mail.omnibey.com,omnimail.app')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const fallbackDomains: DomainItem[] = envDomains.map((name, idx) => ({
      id: `dom_${idx + 1}`,
      domainName: name,
      isActive: true,
      isPremium: name.includes('omnimail.app'),
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, domains: fallbackDomains });
  } catch (err: unknown) {
    console.error('[API /domains] Error fetching domains:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve domains' },
      { status: 500 }
    );
  }
}
