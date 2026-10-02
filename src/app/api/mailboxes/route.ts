import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MockProvider } from '@/lib/providers/mock-provider';
import { generateRandomMailboxAddress, sanitizeLocalPart, isValidLocalPart } from '@/lib/email/generator';
import { Mailbox } from '@/types/email';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-session-token') || request.cookies.get('omnimail_session_token')?.value;

    let userId: string | null = null;
    if (isSupabaseAdminConfigured()) {
      try {
        const userClient = await createServerSupabaseClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (user) userId = user.id;
      } catch {
        // Continue anonymous
      }
    }

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      let query = adminClient
        .from('mailboxes')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionToken) {
        query = query.eq('session_token', sessionToken);
      } else {
        return NextResponse.json({ success: true, mailboxes: [] });
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const mailboxes: Mailbox[] = (data || []).map((m) => ({
        id: m.id,
        address: m.address,
        localPart: m.local_part,
        domain: m.domain,
        userId: m.user_id,
        sessionToken: m.session_token,
        createdAt: m.created_at,
        expiresAt: m.expires_at,
        isActive: m.is_active,
        isCustom: m.is_custom,
        metadata: m.metadata,
      }));

      return NextResponse.json({ success: true, mailboxes });
    }

    // Mock Provider fallback
    const mailboxes = sessionToken ? MockProvider.getMailboxesBySession(sessionToken) : [];
    return NextResponse.json({ success: true, mailboxes });
  } catch (err: unknown) {
    console.error('[API /mailboxes GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve mailboxes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionToken = request.headers.get('x-session-token') || body.sessionToken || `anon_${nanoid(20)}`;
    const domain = body.domain || process.env.NEXT_PUBLIC_DEFAULT_MAIL_DOMAIN || 'omnibey.com';
    const isCustom = Boolean(body.customLocalPart);

    let localPart: string;
    let fullAddress: string;

    if (isCustom) {
      const clean = sanitizeLocalPart(body.customLocalPart);
      if (!isValidLocalPart(clean)) {
        return NextResponse.json(
          { success: false, error: 'Username must be 3-40 alphanumeric characters, dots, or hyphens.' },
          { status: 400 }
        );
      }
      localPart = clean;
      fullAddress = `${localPart}@${domain}`.toLowerCase();
    } else {
      const generated = generateRandomMailboxAddress(domain);
      localPart = generated.localPart;
      fullAddress = generated.address;
    }

    // Expiry calculation: default 60 minutes
    const expiryMinutes = parseInt(process.env.DEFAULT_MAILBOX_EXPIRY_MINUTES || '60', 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000).toISOString();

    let userId: string | null = null;
    if (isSupabaseAdminConfigured()) {
      try {
        const userClient = await createServerSupabaseClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (user) userId = user.id;
      } catch {
        // anonymous
      }
    }

    const newMailbox: Mailbox = {
      id: nanoid(16),
      address: fullAddress,
      localPart,
      domain,
      userId,
      sessionToken,
      createdAt: now.toISOString(),
      expiresAt,
      isActive: true,
      isCustom,
      metadata: {},
    };

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from('mailboxes')
        .insert({
          address: fullAddress,
          local_part: localPart,
          domain,
          user_id: userId,
          session_token: sessionToken,
          expires_at: expiresAt,
          is_active: true,
          is_custom: isCustom,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json(
            { success: false, error: 'This email address is already in use. Please choose another username.' },
            { status: 409 }
          );
        }
        throw error;
      }

      newMailbox.id = data.id;
      newMailbox.createdAt = data.created_at;
      newMailbox.expiresAt = data.expires_at;
    } else {
      // In-memory dev storage
      MockProvider.saveMailbox(newMailbox);
    }

    return NextResponse.json({
      success: true,
      mailbox: newMailbox,
      sessionToken,
    });
  } catch (err: unknown) {
    console.error('[API /mailboxes POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create mailbox' }, { status: 500 });
  }
}
