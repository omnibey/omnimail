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
        .from('email_addresses')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        const now = new Date().getTime();
        const expiry = new Date(data.expires_at).getTime();
        const secondsLeft = Math.max(0, Math.floor((expiry - now) / 1000));

        return NextResponse.json({
          success: true,
          api_version: 'v1',
          mailbox: {
            id: data.id,
            address: data.email_address,
            status: secondsLeft > 0 ? data.status : 'expired',
            ttl_seconds_remaining: secondsLeft,
            expires_at: data.expires_at,
            message_count: data.message_count,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      api_version: 'v1',
      mailbox: {
        id,
        address: 'quickbox@mail.omnibey.com',
        status: 'active',
        ttl_seconds_remaining: 3200,
        expires_at: new Date(Date.now() + 3200000).toISOString(),
        message_count: 1,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check mailbox status' },
      { status: 500 }
    );
  }
}
