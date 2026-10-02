export type VerificationStatus = 'pass' | 'fail' | 'neutral';

export interface Mailbox {
  id: string;
  address: string;
  localPart: string;
  domain: string;
  userId?: string | null;
  sessionToken?: string | null;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  isCustom: boolean;
  metadata?: Record<string, unknown>;
  unreadCount?: number;
}

export interface EmailAttachment {
  id: string;
  messageId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  storagePath: string;
  contentId?: string | null;
  downloadUrl?: string;
  createdAt: string;
}

export interface EmailMessage {
  id: string;
  mailboxId: string;
  recipient: string;
  sender: string;
  senderName?: string | null;
  subject: string;
  snippet: string;
  bodyHtml?: string | null;
  bodyText?: string | null;
  rawEmlPath?: string | null;
  spfStatus: VerificationStatus;
  dkimStatus: VerificationStatus;
  isRead: boolean;
  isStarred: boolean;
  sizeBytes: number;
  receivedAt: string;
  expiresAt: string;
  attachments?: EmailAttachment[];
}

export interface DomainItem {
  id: string;
  domainName: string;
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
}

export interface InboundEmailPayload {
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  rawMime?: string;
  spf?: VerificationStatus;
  dkim?: VerificationStatus;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    contentType: string;
    contentBase64: string;
    contentId?: string;
  }>;
}

export interface MailboxStats {
  activeMailboxes: number;
  totalMessagesReceived: number;
  spamBlocked: number;
  avgDeliverySeconds: number;
}
