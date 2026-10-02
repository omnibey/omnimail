import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/EmailService';
import { ApiKeyService } from '@/lib/services/ApiKeyService';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('x-api-key') || '';
    const rawKey = authHeader.replace(/^Bearer\s+/i, '').trim();

    let userId: string | undefined = undefined;

    if (rawKey) {
      const auth = await ApiKeyService.validateKey(rawKey);
      if (auth.valid) {
        userId = auth.userId;
      }
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const { customPrefix, domain, durationMinutes } = body;

    const mailbox = await EmailService.createAddress({
      userId,
      customPrefix,
      domain,
      durationMinutes: Number(durationMinutes) || 60,
    });

    return NextResponse.json({
      success: true,
      api_version: 'v1',
      mailbox: {
        id: mailbox.id,
        address: mailbox.emailAddress,
        created_at: mailbox.createdAt,
        expires_at: mailbox.expiresAt,
        status: mailbox.status,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate temporary mailbox' },
      { status: 500 }
    );
  }
}
