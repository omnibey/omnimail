'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Trash2,
  Printer,
  Copy,
  ShieldCheck,
  ShieldAlert,
  Download,
  Paperclip,
  Code,
  FileText,
  Eye,
  Check,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { sanitizeEmailHtml } from '@/lib/email/sanitizer';
import { extractOtpFromEmail } from '@/lib/email/otp-detector';
import { formatBytes } from '@/lib/utils';
import { EmailMessage } from '@/types/email';

interface MessageDetailProps {
  message: EmailMessage | null;
  onBack?: () => void;
  onDeleteMessage: (id: string) => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onBack,
  onDeleteMessage,
}) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [showHeaders, setShowHeaders] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const { success } = useToast();

  if (!message) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-lg transition-all duration-200">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center mb-3">
          <Eye className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">No Email Selected</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          Select an email from your inbox on the left to read its full content, copy detected 2FA codes with 1 click, and download attachments.
        </p>
      </div>
    );
  }

  const detectedOtp = extractOtpFromEmail(message.subject, message.bodyText, message.bodyHtml);
  const sanitizedHtml = sanitizeEmailHtml(message.bodyHtml || message.bodyText || '');

  const handleCopyOtp = () => {
    if (!detectedOtp) return;
    navigator.clipboard.writeText(detectedOtp.code);
    setCopiedOtp(true);
    success(`Verification code ${detectedOtp.code} copied!`);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleCopyBody = () => {
    const textToCopy = message.bodyText || message.snippet || message.bodyHtml || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedBody(true);
    success('Email text copied to clipboard!');
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const senderInitial = (message.senderName || message.sender || '?')[0].toUpperCase();

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg transition-all duration-200">
      {/* Top action toolbar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="lg:hidden text-xs px-2.5 h-8 border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          )}

          {/* HTML vs Text Switch */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setViewMode('html')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'html'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" /> HTML
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'text'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" /> Text
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyBody}
            title="Copy email text"
            className="h-8 w-8 text-slate-600 dark:text-slate-300"
          >
            {copiedBody ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHeaders(!showHeaders)}
            title="View email headers"
            className="h-8 w-8 text-slate-600 dark:text-slate-300"
          >
            <Code className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrint}
            title="Print email"
            className="h-8 w-8 text-slate-600 dark:text-slate-300"
          >
            <Printer className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteMessage(message.id)}
            title="Delete email"
            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* DETECTED OTP / VERIFICATION CODE PROMINENT BANNER (Inspired by RealOTP feature) */}
      {detectedOtp && (
        <div className="p-3 sm:px-6 bg-gradient-to-r from-sky-500/10 via-indigo-500/15 to-purple-500/10 border-b border-sky-400/30 dark:border-sky-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Detected Verification Code</span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold tracking-widest text-slate-900 dark:text-white">
                {detectedOtp.code}
              </div>
            </div>
          </div>

          <Button
            variant="glow"
            size="sm"
            onClick={handleCopyOtp}
            className={`shadow-md transition-all ${copiedOtp ? 'animate-copy-pop bg-emerald-600' : ''}`}
          >
            {copiedOtp ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Message Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          {message.subject}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md">
              {senderInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {message.senderName || message.sender}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">&lt;{message.sender}&gt;</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                To: <span className="font-mono text-slate-700 dark:text-slate-300">{message.recipient}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* SPF / DKIM verification badges */}
            {message.spfStatus === 'pass' && (
              <Badge variant="success">
                <ShieldCheck className="w-3 h-3" /> SPF Pass
              </Badge>
            )}
            {message.dkimStatus === 'pass' && (
              <Badge variant="success">
                <ShieldCheck className="w-3 h-3" /> DKIM Pass
              </Badge>
            )}
            {message.spfStatus === 'fail' && (
              <Badge variant="danger">
                <ShieldAlert className="w-3 h-3" /> SPF Fail
              </Badge>
            )}

            <span className="text-slate-500 font-mono text-[11px]">
              {new Date(message.receivedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Expandable Headers drawer */}
        {showHeaders && (
          <div className="mt-4 p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1 animate-in fade-in">
            <div className="font-semibold text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-800">
              Security &amp; Ingestion Route
            </div>
            <div><strong className="text-slate-400">ID:</strong> {message.id}</div>
            <div><strong className="text-slate-400">From:</strong> {message.sender}</div>
            <div><strong className="text-slate-400">To:</strong> {message.recipient}</div>
            <div><strong className="text-slate-400">SPF / DKIM:</strong> {message.spfStatus} / {message.dkimStatus}</div>
            <div><strong className="text-slate-400">Route:</strong> Cloudflare Email Edge &rarr; OmniBey Ingest API</div>
          </div>
        )}
      </div>

      {/* Attachments Section if any */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="p-3 sm:px-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mr-2">
            <Paperclip className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Attachments ({message.attachments.length}):</span>
          </div>
          {message.attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 shadow-xs"
            >
              <span className="truncate max-w-[150px] font-mono">{att.filename}</span>
              <span className="text-slate-500 text-[10px]">({formatBytes(att.sizeBytes)})</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-indigo-600 dark:text-sky-400 hover:text-indigo-700 dark:hover:text-sky-300"
                onClick={() => {
                  if (att.downloadUrl) {
                    window.open(att.downloadUrl, '_blank');
                  } else {
                    success(`Downloading ${att.filename}...`);
                  }
                }}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Email Body Viewer */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-950/40">
        {viewMode === 'html' ? (
          <div
            className="email-content-sandbox text-slate-900 dark:text-slate-100 max-w-none text-sm break-words overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <pre className="text-xs font-mono text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed font-normal bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            {message.bodyText || message.snippet || 'No plain text version provided.'}
          </pre>
        )}
      </div>
    </div>
  );
};
