import { simpleParser, ParsedMail, Attachment } from 'mailparser';
import { EmailAttachment, InboundEmailPayload, VerificationStatus } from '@/types/email';
import { extractTextSnippet } from './sanitizer';

export interface ParsedEmailResult {
  recipient: string;
  sender: string;
  senderName?: string;
  subject: string;
  snippet: string;
  bodyHtml?: string;
  bodyText?: string;
  spfStatus: VerificationStatus;
  dkimStatus: VerificationStatus;
  attachments: Array<{
    filename: string;
    contentType: string;
    sizeBytes: number;
    buffer: Buffer;
    contentId?: string;
  }>;
}

/**
 * Parses raw MIME EML email content
 */
export async function parseRawEmail(rawEml: string | Buffer): Promise<ParsedEmailResult> {
  const parsed: ParsedMail = await simpleParser(rawEml);

  const sender = parsed.from?.value?.[0]?.address || 'unknown@sender.com';
  const senderName = parsed.from?.value?.[0]?.name || sender.split('@')[0];
  const recipient = parsed.to
    ? Array.isArray(parsed.to)
      ? parsed.to[0]?.value?.[0]?.address || ''
      : parsed.to.value?.[0]?.address || ''
    : '';

  const subject = parsed.subject || '(No Subject)';
  const bodyHtml = parsed.html ? String(parsed.html) : undefined;
  const bodyText = parsed.text ? String(parsed.text) : undefined;

  const snippet = extractTextSnippet(bodyText || bodyHtml || '');

  // Extract SPF / DKIM from Authentication-Results header
  const authResults = String(parsed.headers.get('authentication-results') || '');
  let spfStatus: VerificationStatus = 'neutral';
  let dkimStatus: VerificationStatus = 'neutral';

  if (/spf=pass/i.test(authResults)) spfStatus = 'pass';
  else if (/spf=fail/i.test(authResults)) spfStatus = 'fail';

  if (/dkim=pass/i.test(authResults)) dkimStatus = 'pass';
  else if (/dkim=fail/i.test(authResults)) dkimStatus = 'fail';

  // Process attachments
  const attachments = (parsed.attachments || []).map((att: Attachment) => ({
    filename: att.filename || 'attachment',
    contentType: att.contentType || 'application/octet-stream',
    sizeBytes: att.size || att.content?.length || 0,
    buffer: att.content,
    contentId: att.contentId ? att.contentId.replace(/[<>]/g, '') : undefined,
  }));

  return {
    recipient: recipient.toLowerCase(),
    sender,
    senderName,
    subject,
    snippet,
    bodyHtml,
    bodyText,
    spfStatus,
    dkimStatus,
    attachments,
  };
}

/**
 * Normalizes payload when received from standard JSON webhook (e.g. Cloudflare Worker or Mock)
 */
export function normalizeJsonPayload(payload: InboundEmailPayload): ParsedEmailResult {
  const snippet = extractTextSnippet(payload.text || payload.html || '');
  const attachments = (payload.attachments || []).map((att) => ({
    filename: att.filename,
    contentType: att.contentType,
    sizeBytes: Buffer.from(att.contentBase64, 'base64').length,
    buffer: Buffer.from(att.contentBase64, 'base64'),
    contentId: att.contentId,
  }));

  return {
    recipient: payload.to.toLowerCase(),
    sender: payload.from,
    senderName: payload.fromName || payload.from.split('@')[0],
    subject: payload.subject || '(No Subject)',
    snippet,
    bodyHtml: payload.html,
    bodyText: payload.text,
    spfStatus: payload.spf || 'neutral',
    dkimStatus: payload.dkim || 'neutral',
    attachments,
  };
}
