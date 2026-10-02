import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { MockProvider } from '@/lib/providers/mock-provider';
import { EmailMessage } from '@/types/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const recipient = (body.to || '').toLowerCase().trim();
    const templateType = body.template || 'verification';

    if (!recipient || !recipient.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid recipient email is required' }, { status: 400 });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    let sender = 'auth@service.omnibey.com';
    let senderName = 'OmniBey Security';
    let subject = `Verify your identity (Code: ${verificationCode})`;
    let snippet = `Your one-time verification code is ${verificationCode}. Valid for 10 minutes.`;
    let html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <div style="background: linear-gradient(135deg, #6366f1, #a855f7); width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; color: white; margin-right: 12px; text-align: center; line-height: 36px;">OB</div>
          <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">OmniBey Auth</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #ffffff;">Confirm your authentication request</h2>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
          We received a login attempt for your account. Enter this 6-digit confirmation code on the verification screen:
        </p>
        <div style="background: #1e293b; border: 1px dashed #475569; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${verificationCode}</span>
        </div>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 24px;">This code expires in 10 minutes. If you did not make this request, please disregard this email.</p>
        <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <div style="color: #475569; font-size: 12px;">
          Sent by OmniBey Security Guardian &bull; Protected by OmniMail
        </div>
      </div>
    `;

    if (templateType === 'github') {
      sender = 'notifications@github.com';
      senderName = 'GitHub Notifications';
      subject = '[OmniBey/core] Pull Request #42 merged: "Upgrade Cloudflare Edge Routing"';
      snippet = 'omni-bot merged commit 8a93fe into main. All 42 checks passed.';
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #24292f; border: 1px solid #d0d7de; border-radius: 8px;">
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 12px; color: #0969da;">OmniBey / omnimail-core</div>
          <h2 style="font-size: 18px; margin-bottom: 16px; color: #1f2328;">Pull Request #42 Merged</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #57606a;">
            <strong>@core-maintainer</strong> merged commit <code style="background: #f6f8fa; padding: 2px 6px; border-radius: 4px;">8a93fe</code> into branch <code style="background: #f6f8fa; padding: 2px 6px; border-radius: 4px;">main</code>.
          </p>
          <div style="background: #f6f8fa; border-left: 4px solid #2da44e; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 13px;">
            &bull; All 42 automated tests and RLS policy verifications passed successfully.
          </div>
          <a href="https://omnibey.com" style="display: inline-block; background: #2da44e; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 12px;">View Pull Request</a>
        </div>
      `;
    } else if (templateType === 'receipt') {
      sender = 'billing@omnibey.com';
      senderName = 'OmniBey Billing';
      subject = `Receipt for Invoice ${invoiceNumber} - OmniBey Pro`;
      snippet = `Thank you for your business. Payment of $19.00 USD was successfully processed.`;
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0b0f19; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: bold; color: #f8fafc;">OmniBey Inc.</span>
            <span style="color: #10b981; font-weight: 600;">PAID</span>
          </div>
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 4px; color: #f8fafc;">$19.00 USD</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Paid on ${new Date().toLocaleDateString()} via Visa ending in 4242</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #1e293b; color: #64748b; text-align: left;">
              <th style="padding: 8px 0;">Description</th>
              <th style="padding: 8px 0; text-align: right;">Amount</th>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 12px 0; color: #e2e8f0;">OmniMail Pro Monthly Plan (Unlimited Mailboxes, Custom Domains)</td>
              <td style="padding: 12px 0; text-align: right; color: #f8fafc; font-weight: 600;">$19.00</td>
            </tr>
          </table>
          <p style="color: #64748b; font-size: 12px;">Invoice Number: ${invoiceNumber} &bull; Thank you for using OmniBey.</p>
        </div>
      `;
    }

    if (body.customSubject) subject = body.customSubject;
    if (body.customSender) sender = body.customSender;

    // Check if Supabase is active
    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient();
      const { data: mailbox } = await adminClient
        .from('mailboxes')
        .select('id, expires_at')
        .eq('address', recipient)
        .single();

      if (mailbox) {
        const { data: messageRecord, error } = await adminClient
          .from('messages')
          .insert({
            mailbox_id: mailbox.id,
            recipient,
            sender,
            sender_name: senderName,
            subject,
            snippet,
            body_html: html,
            body_text: snippet,
            spf_status: 'pass',
            dkim_status: 'pass',
            is_read: false,
            size_bytes: html.length,
            expires_at: mailbox.expires_at,
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          messageId: messageRecord.id,
          recipient,
          note: 'Delivered to Supabase database',
        });
      }
    }

    // In-memory dev storage
    const msg: EmailMessage = {
      id: nanoid(14),
      mailboxId: recipient,
      recipient,
      sender,
      senderName,
      subject,
      snippet,
      bodyHtml: html,
      bodyText: snippet,
      spfStatus: 'pass',
      dkimStatus: 'pass',
      isRead: false,
      isStarred: false,
      sizeBytes: html.length,
      receivedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    MockProvider.addMessage(recipient, msg);

    return NextResponse.json({
      success: true,
      messageId: msg.id,
      recipient,
      note: 'Delivered to in-memory development mailbox',
    });
  } catch (err: unknown) {
    console.error('[API /email/send-test] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to send test email' }, { status: 500 });
  }
}
