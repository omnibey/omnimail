import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = getAdminClient();

    if (adminClient) {
      await adminClient.from('email_addresses').delete().eq('id', id);
    }

    return NextResponse.json({
      success: true,
      api_version: 'v1',
      message: `Mailbox ${id} permanently deleted`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete mailbox' },
      { status: 500 }
    );
  }
}
