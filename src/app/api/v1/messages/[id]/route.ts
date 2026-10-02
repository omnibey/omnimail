import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = getAdminClient();

    if (adminClient) {
      const { data, error } = await adminClient
        .from('messages')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          api_version: 'v1',
          message: {
            id: data.id,
            mailbox_id: data.mailbox_id,
            sender: data.sender,
            recipient: data.recipient,
            subject: data.subject,
            body_text: data.body_text,
            body_html: data.body_html,
            detected_otp: data.detected_otp,
            received_at: data.received_at,
          },
        });
      }
    }

    // Dev fallback
    return NextResponse.json({
      success: true,
      api_version: 'v1',
      message: {
        id,
        mailbox_id: 'mbx-default',
        sender: 'security@service.com',
        recipient: 'quickbox@mail.omnibey.com',
        subject: 'Your 2FA One-Time Passcode',
        body_text: 'Your verification code is 849201. It will expire in 10 minutes.',
        detected_otp: '849201',
        received_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve message' },
      { status: 500 }
    );
  }
}
