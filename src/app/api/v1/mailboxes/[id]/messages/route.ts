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
        .eq('mailbox_id', id)
        .order('received_at', { ascending: false });

      if (error) throw new Error(error.message);

      return NextResponse.json({
        success: true,
        api_version: 'v1',
        mailbox_id: id,
        messages: (data || []).map((m) => ({
          id: m.id,
          sender: m.sender,
          recipient: m.recipient,
          subject: m.subject,
          body_text: m.body_text,
          detected_otp: m.detected_otp,
          received_at: m.received_at,
          is_read: m.is_read,
        })),
      });
    }

    // Dev demo messages
    return NextResponse.json({
      success: true,
      api_version: 'v1',
      mailbox_id: id,
      messages: [
        {
          id: `msg-${id}-1`,
          sender: 'security@service.com',
          recipient: 'quickbox@mail.omnibey.com',
          subject: 'Your 2FA One-Time Passcode',
          body_text: 'Your verification code is 849201. It will expire in 10 minutes.',
          detected_otp: '849201',
          received_at: new Date().toISOString(),
          is_read: false,
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list messages' },
      { status: 500 }
    );
  }
}
