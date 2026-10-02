import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { MockProvider } from '@/lib/providers/mock-provider';
import { EmailMessage } from '@/types/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      let query = adminClient
        .from('messages')
        .select(`
          id,
          mailbox_id,
          recipient,
          sender,
          sender_name,
          subject,
          snippet,
          body_html,
          body_text,
          raw_eml_path,
          spf_status,
          dkim_status,
          is_read,
          is_starred,
          size_bytes,
          received_at,
          expires_at,
          attachments (
            id,
            filename,
            content_type,
            size_bytes,
            storage_path,
            content_id,
            created_at
          )
        `);

      if (id && id !== 'by-address') {
        query = query.eq('mailbox_id', id);
      } else if (address) {
        query = query.eq('recipient', address.toLowerCase());
      } else {
        return NextResponse.json({ success: true, messages: [] });
      }

      const { data, error } = await query.order('received_at', { ascending: false });

      if (error) {
        throw error;
      }

      const messages: EmailMessage[] = (data || []).map((m) => ({
        id: m.id,
        mailboxId: m.mailbox_id,
        recipient: m.recipient,
        sender: m.sender,
        senderName: m.sender_name,
        subject: m.subject,
        snippet: m.snippet,
        bodyHtml: m.body_html,
        bodyText: m.body_text,
        rawEmlPath: m.raw_eml_path,
        spfStatus: m.spf_status,
        dkimStatus: m.dkim_status,
        isRead: m.is_read,
        isStarred: m.is_starred,
        sizeBytes: m.size_bytes,
        receivedAt: m.received_at,
        expiresAt: m.expires_at,
        attachments: (m.attachments || []).map((att: {
          id: string;
          filename: string;
          content_type: string;
          size_bytes: number;
          storage_path: string;
          content_id?: string | null;
          created_at: string;
        }) => ({
          id: att.id,
          messageId: m.id,
          filename: att.filename,
          contentType: att.content_type,
          sizeBytes: att.size_bytes,
          storagePath: att.storage_path,
          contentId: att.content_id,
          createdAt: att.created_at,
        })),
      }));

      return NextResponse.json({ success: true, messages });
    }

    // In-memory dev fallback
    const targetAddress = address || id;
    const messages = MockProvider.getMessages(targetAddress);
    return NextResponse.json({ success: true, messages });
  } catch (err: unknown) {
    console.error('[API /mailboxes/[id]/messages GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve messages' }, { status: 500 });
  }
}
