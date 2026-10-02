import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/PaymentService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, adminId, adminEmail, rejectionReason } = body;

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject".' },
        { status: 400 }
      );
    }

    const result = await PaymentService.reviewPayment({
      paymentId: id,
      adminId: adminId || 'admin-root',
      adminEmail: adminEmail || 'alex.admin@omnibey.com',
      action,
      rejectionReason,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Payment review action failed' },
      { status: 400 }
    );
  }
}
