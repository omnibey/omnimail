import { MailProvider, ProviderHealth, ProviderType } from './mail-provider.interface';
import { ParsedEmailResult } from '@/lib/email/parser';
import { EmailMessage, Mailbox } from '@/types/email';

// Global singleton in-memory storage for dev/demo fallback
const inMemoryMailboxes = new Map<string, Mailbox>();
const inMemoryMessages = new Map<string, EmailMessage[]>();

export class MockProvider implements MailProvider {
  readonly id = 'mock';
  readonly name = 'OmniBey Dev & Simulation Provider';
  readonly type: ProviderType = 'bidirectional';

  async initialize(): Promise<void> {}

  async processInbound(payload: unknown): Promise<ParsedEmailResult> {
    const data = payload as Record<string, string>;
    return {
      recipient: data.to || 'demo@omnibey.com',
      sender: data.from || 'security@service.com',
      senderName: data.fromName || 'Security Team',
      subject: data.subject || 'Your Verification Code',
      snippet: data.text || 'Use code 849201 to complete your verification.',
      bodyHtml: data.html || `<div style="font-family:sans-serif;padding:24px;background:#f8fafc;border-radius:12px">
        <h2 style="color:#0f172a">Verify your login request</h2>
        <p style="color:#475569">Here is your one-time verification security code:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#4f46e5;padding:16px 0">${Math.floor(100000 + Math.random() * 900000)}</div>
        <p style="color:#64748b;font-size:12px">If you did not request this, you can safely ignore this email.</p>
      </div>`,
      bodyText: data.text || 'Your verification code is 849201',
      spfStatus: 'pass',
      dkimStatus: 'pass',
      attachments: [],
    };
  }

  async sendOutbound(params: {
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const id = `mock_msg_${Date.now()}`;
    return { success: true, messageId: id };
  }

  async checkHealth(): Promise<ProviderHealth> {
    return {
      status: 'healthy',
      latencyMs: 1,
      message: 'Simulation and dev mock provider is active',
    };
  }

  // Helper methods for in-memory dev mode
  static saveMailbox(mailbox: Mailbox): void {
    inMemoryMailboxes.set(mailbox.address.toLowerCase(), mailbox);
    if (!inMemoryMessages.has(mailbox.address.toLowerCase())) {
      inMemoryMessages.set(mailbox.address.toLowerCase(), []);
    }
  }

  static getMailbox(address: string): Mailbox | undefined {
    return inMemoryMailboxes.get(address.toLowerCase());
  }

  static getMailboxesBySession(sessionToken: string): Mailbox[] {
    const results: Mailbox[] = [];
    for (const mb of inMemoryMailboxes.values()) {
      if (mb.sessionToken === sessionToken && mb.isActive) {
        results.push(mb);
      }
    }
    return results;
  }

  static addMessage(address: string, message: EmailMessage): void {
    const normalized = address.toLowerCase();
    const existing = inMemoryMessages.get(normalized) || [];
    inMemoryMessages.set(normalized, [message, ...existing]);
  }

  static getMessages(address: string): EmailMessage[] {
    return inMemoryMessages.get(address.toLowerCase()) || [];
  }

  static deleteMessage(address: string, messageId: string): boolean {
    const list = inMemoryMessages.get(address.toLowerCase()) || [];
    const filtered = list.filter((m) => m.id !== messageId);
    inMemoryMessages.set(address.toLowerCase(), filtered);
    return filtered.length < list.length;
  }

  static markMessageAsRead(address: string, messageId: string): void {
    const list = inMemoryMessages.get(address.toLowerCase()) || [];
    const item = list.find((m) => m.id === messageId);
    if (item) item.isRead = true;
  }
}
