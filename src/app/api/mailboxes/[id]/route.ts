import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { MockProvider } from '@/lib/providers/mock-provider';
import { Mailbox } from '@/types/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from('mailboxes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return NextResponse.json({ success: false, error: 'Mailbox not found' }, { status: 404 });
      }

      const mailbox: Mailbox = {
        id: data.id,
        address: data.address,
        localPart: data.local_part,
        domain: data.domain,
        userId: data.user_id,
        sessionToken: data.session_token,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        isActive: data.is_active,
        isCustom: data.is_custom,
      };

      return NextResponse.json({ success: true, mailbox });
    }

    // In-memory dev fallback
    const mailbox = MockProvider.getMailbox(id);
    if (!mailbox) {
      return NextResponse.json({ success: false, error: 'Mailbox not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, mailbox });
  } catch (err: unknown) {
    console.error('[API /mailboxes/[id] GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve mailbox' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const extendMinutes = Number(body.extendMinutes) || 60;

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      
      // Get current expires_at
      const { data: existing, error: getErr } = await adminClient
        .from('mailboxes')
        .select('expires_at')
        .eq('id', id)
        .single();

      if (getErr || !existing) {
        return NextResponse.json({ success: false, error: 'Mailbox not found' }, { status: 404 });
      }

      const currentExpiry = new Date(existing.expires_at).getTime();
      const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
      const newExpiry = new Date(baseTime + extendMinutes * 60 * 1000).toISOString();

      const { data, error } = await adminClient
        .from('mailboxes')
        .update({ expires_at: newExpiry })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        expiresAt: data.expires_at,
        message: `Mailbox extended by ${extendMinutes} minutes.`,
      });
    }

    // In-memory dev fallback
    const mb = MockProvider.getMailbox(id);
    if (mb) {
      const currentExpiry = new Date(mb.expiresAt).getTime();
      const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
      mb.expiresAt = new Date(baseTime + extendMinutes * 60 * 1000).toISOString();
      return NextResponse.json({
        success: true,
        expiresAt: mb.expiresAt,
        message: `Mailbox extended by ${extendMinutes} minutes.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Mailbox not found' }, { status: 404 });
  } catch (err: unknown) {
    console.error('[API /mailboxes/[id] PATCH] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to extend mailbox' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('mailboxes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Mailbox deleted successfully' });
    }

    return NextResponse.json({ success: true, message: 'Mailbox deleted from dev store' });
  } catch (err: unknown) {
    console.error('[API /mailboxes/[id] DELETE] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete mailbox' }, { status: 500 });
  }
}
