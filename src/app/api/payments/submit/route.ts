import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/PaymentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, packageId, amount, paymentMethod, senderIdentifier, transactionId, screenshotPath, notes } = body;

    const payment = await PaymentService.submitPayment({
      userId: userId || 'dev-user-123',
      userEmail: userEmail || 'developer@omnibey.com',
      packageId,
      amount: Number(amount) || 5.0,
      paymentMethod,
      senderIdentifier,
      transactionId,
      screenshotPath,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verification order submitted successfully',
      payment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit payment' },
      { status: 400 }
    );
  }
}
