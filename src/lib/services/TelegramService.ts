/**
 * TelegramService — Admin Notification System
 * Implements Section 17 & 35 of the Master Specification.
 */

interface PaymentNotificationParams {
  paymentReference: string;
  userEmail: string;
  method: string;
  amount: number | string;
  currency?: string;
  senderIdentifier: string;
  transactionId?: string;
  status?: string;
}

export class TelegramService {
  private static getCredentials() {
    return {
      token: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
    };
  }

  /**
   * Dispatches a raw text message to the Admin Telegram chat.
   */
  static async sendMessage(text: string): Promise<boolean> {
    const { token, chatId } = this.getCredentials();

    if (!token || !chatId) {
      console.warn('[TelegramService] Telegram credentials not configured. Notification skipped.');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TelegramService] Failed to send Telegram message:', errorText);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[TelegramService] Exception during Telegram dispatch:', err);
      return false;
    }
  }

  /**
   * Notifies admin of a newly submitted payment.
   */
  static async notifyNewPayment(params: PaymentNotificationParams): Promise<boolean> {
    const {
      paymentReference,
      userEmail,
      method,
      amount,
      currency = 'USD',
      senderIdentifier,
      transactionId,
      status = 'Pending',
    } = params;

    const currencySymbol = method.toLowerCase() === 'binance' ? '$' : '৳';
    const message = `
🔔 <b>New Payment Submitted</b>

<b>Payment ID:</b> <code>#${paymentReference}</code>
<b>User:</b> ${userEmail}
<b>Method:</b> ${method.toUpperCase()}
<b>Amount:</b> ${currencySymbol}${amount} (${currency})
<b>Sender ID:</b> <code>${senderIdentifier}</code>
${transactionId ? `<b>Txn ID:</b> <code>${transactionId}</code>\n` : ''}<b>Status:</b> 🟡 ${status}

<i>👉 Please review in the OmniBey Admin Panel: /admin/payments</i>
    `.trim();

    return this.sendMessage(message);
  }

  /**
   * Notifies admin of payment review action (Approval or Rejection).
   */
  static async notifyPaymentReviewed(params: {
    paymentReference: string;
    status: 'approved' | 'rejected';
    adminEmail?: string;
    creditsAdded?: number;
    reason?: string;
  }): Promise<boolean> {
    const { paymentReference, status, adminEmail, creditsAdded, reason } = params;

    const icon = status === 'approved' ? '✅' : '❌';
    const message = `
${icon} <b>Payment ${status.toUpperCase()}</b>

<b>Payment ID:</b> <code>#${paymentReference}</code>
<b>Reviewed By:</b> ${adminEmail || 'Admin'}
${creditsAdded ? `<b>Credits Granted:</b> +${creditsAdded}\n` : ''}${reason ? `<b>Reason:</b> ${reason}\n` : ''}<b>Timestamp:</b> ${new Date().toISOString()}
    `.trim();

    return this.sendMessage(message);
  }

  /**
   * System or Provider Alert Notification.
   */
  static async notifySystemAlert(alert: {
    title: string;
    severity: 'info' | 'warning' | 'critical';
    details: string;
  }): Promise<boolean> {
    const icon = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
    const message = `
${icon} <b>OmniBey System Alert: ${alert.title}</b>
<b>Severity:</b> ${alert.severity.toUpperCase()}

${alert.details}

<i>Timestamp: ${new Date().toISOString()}</i>
    `.trim();

    return this.sendMessage(message);
  }
}
