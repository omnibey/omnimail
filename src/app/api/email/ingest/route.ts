import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { providerRegistry } from '@/lib/providers/registry';
import { CloudflareEmailProvider } from '@/lib/providers/cloudflare-provider';
import { MockProvider } from '@/lib/providers/mock-provider';
import { EmailMessage } from '@/types/email';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cloudflareProvider = (providerRegistry.getProvider('cloudflare') as CloudflareEmailProvider) || new CloudflareEmailProvider();

    // 1. Verify Secret
    if (process.env.INGESTION_WEBHOOK_SECRET) {
      if (!cloudflareProvider.verifyWebhookAuth(authHeader)) {
        return NextResponse.json({ success: false, error: 'Unauthorized webhook request' }, { status: 401 });
      }
    }

    // 2. Parse payload (JSON or raw text)
    const contentType = request.headers.get('content-type') || '';
    let rawPayload: unknown;

    if (contentType.includes('application/json')) {
      rawPayload = await request.json();
    } else {
      rawPayload = await request.text();
    }

    // 3. Process Inbound through Provider Pipeline
    const parsed = await cloudflareProvider.processInbound(rawPayload);
    const recipientAddress = parsed.recipient.toLowerCase();

    // 4. Verify Recipient Mailbox Exists and is Active
    let mailboxId: string | null = null;
    let mailboxExpiresAt: string = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      const { data: mailbox, error: mbError } = await adminClient
        .from('mailboxes')
        .select('id, expires_at, is_active')
        .eq('address', recipientAddress)
        .single();

      if (mbError || !mailbox) {
        return NextResponse.json(
          { success: false, message: `Mailbox ${recipientAddress} does not exist or has expired.` },
          { status: 404 }
        );
      }

      if (!mailbox.is_active || new Date(mailbox.expires_at) < new Date()) {
        return NextResponse.json(
          { success: false, message: `Mailbox ${recipientAddress} is inactive or expired.` },
          { status: 410 }
        );
      }

      mailboxId = mailbox.id;
      mailboxExpiresAt = mailbox.expires_at;

      // 5. Insert Message into Supabase
      const { data: messageRecord, error: msgError } = await adminClient
        .from('messages')
        .insert({
          mailbox_id: mailboxId,
          recipient: recipientAddress,
          sender: parsed.sender,
          sender_name: parsed.senderName,
          subject: parsed.subject,
          snippet: parsed.snippet,
          body_html: parsed.bodyHtml,
          body_text: parsed.bodyText,
          spf_status: parsed.spfStatus,
          dkim_status: parsed.dkimStatus,
          is_read: false,
          is_starred: false,
          size_bytes: (parsed.bodyHtml?.length || 0) + (parsed.bodyText?.length || 0),
          expires_at: mailboxExpiresAt,
        })
        .select()
        .single();

      if (msgError) {
        throw msgError;
      }

      // 6. Handle Attachments if any
      if (parsed.attachments && parsed.attachments.length > 0) {
        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'omnimail-attachments';
        for (const att of parsed.attachments) {
          const storagePath = `${mailboxId}/${messageRecord.id}/${nanoid(8)}_${att.filename}`;
          
          try {
            await adminClient.storage.from(bucketName).upload(storagePath, att.buffer, {
              contentType: att.contentType,
              upsert: true,
            });

            await adminClient.from('attachments').insert({
              message_id: messageRecord.id,
              filename: att.filename,
              content_type: att.contentType,
              size_bytes: att.sizeBytes,
              storage_path: storagePath,
              content_id: att.contentId,
            });
          } catch (storageErr) {
            console.error('[API /email/ingest] Failed to upload attachment:', storageErr);
          }
        }
      }

      return NextResponse.json({
        success: true,
        messageId: messageRecord.id,
        recipient: recipientAddress,
      });
    }

    // Dev / In-memory fallback
    const mockMessage: EmailMessage = {
      id: nanoid(16),
      mailboxId: recipientAddress,
      recipient: recipientAddress,
      sender: parsed.sender,
      senderName: parsed.senderName,
      subject: parsed.subject,
      snippet: parsed.snippet,
      bodyHtml: parsed.bodyHtml,
      bodyText: parsed.bodyText,
      spfStatus: parsed.spfStatus,
      dkimStatus: parsed.dkimStatus,
      isRead: false,
      isStarred: false,
      sizeBytes: 1024,
      receivedAt: new Date().toISOString(),
      expiresAt: mailboxExpiresAt,
      attachments: parsed.attachments.map((att) => ({
        id: nanoid(12),
        messageId: 'dev',
        filename: att.filename,
        contentType: att.contentType,
        sizeBytes: att.sizeBytes,
        storagePath: '',
        createdAt: new Date().toISOString(),
      })),
    };

    MockProvider.addMessage(recipientAddress, mockMessage);

    return NextResponse.json({
      success: true,
      messageId: mockMessage.id,
      recipient: recipientAddress,
      provider: 'in-memory-dev',
    });
  } catch (err: unknown) {
    console.error('[API /email/ingest] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal ingestion error' }, { status: 500 });
  }
}
