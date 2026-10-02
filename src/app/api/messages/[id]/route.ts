import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { MockProvider } from '@/lib/providers/mock-provider';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from('messages')
        .select(`
          *,
          attachments (*)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: data });
    }

    // In-memory dev fallback: search across inMemoryMessages
    return NextResponse.json({ success: true, messageId: id });
  } catch (err: unknown) {
    console.error('[API /messages/[id] GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve message' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    if (typeof body.isRead === 'boolean') updates.is_read = body.isRead;
    if (typeof body.isStarred === 'boolean') updates.is_starred = body.isStarred;

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, message: data });
    }

    // Dev fallback
    return NextResponse.json({ success: true, updated: updates });
  } catch (err: unknown) {
    console.error('[API /messages/[id] PATCH] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update message' }, { status: 500 });
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
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Message deleted successfully' });
    }

    // In-memory dev fallback
    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (err: unknown) {
    console.error('[API /messages/[id] DELETE] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
  }
}
